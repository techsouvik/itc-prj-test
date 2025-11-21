/**
 * Work Item Manager Module
 * Handles CRUD operations for Azure DevOps work items (issues and tasks)
 */

import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import { WorkItem } from '../types';

/**
 * Azure DevOps API client for work item operations
 */
const azureClient: AxiosInstance = axios.create({
  baseURL: `${config.azure.orgUrl}/${config.azure.project}/_apis`,
  auth: {
    username: '',
    password: config.azure.pat,
  },
  headers: {
    'Content-Type': 'application/json-patch+json',
  },
});

/**
 * Creates a new work item
 * @param workItemType - Type of work item (e.g., 'Task', 'Bug', 'User Story')
 * @param title - Work item title
 * @param description - Work item description (optional)
 * @param assignedTo - User to assign the work item to (optional)
 * @returns Created WorkItem object
 */
export async function createWorkItem(
  workItemType: string,
  title: string,
  description?: string,
  assignedTo?: string
): Promise<WorkItem> {
  try {
    const operations = [
      {
        op: 'add',
        path: '/fields/System.Title',
        value: title,
      },
    ];

    if (description) {
      operations.push({
        op: 'add',
        path: '/fields/System.Description',
        value: description,
      });
    }

    if (assignedTo) {
      operations.push({
        op: 'add',
        path: '/fields/System.AssignedTo',
        value: assignedTo,
      });
    }

    // URL-encode the work item type to handle types with spaces (e.g., "User Story")
    const encodedType = encodeURIComponent(workItemType);
    const response = await azureClient.post(`/wit/workitems/$${encodedType}`, operations, {
      params: { 'api-version': '7.0' },
    });

    return response.data;
  } catch (error: any) {
    const errorDetails = {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      workItemType,
      title
    };
    console.error('Error creating work item:', JSON.stringify(errorDetails, null, 2));
    const errorMsg = error.response?.data?.message || error.response?.data?.value || error.message;
    throw new Error(`Failed to create ${workItemType}: ${errorMsg}`);
  }
}

/**
 * Updates an existing work item
 * @param workItemId - ID of the work item to update
 * @param updates - Object containing fields to update
 * @returns Updated WorkItem object
 */
export async function updateWorkItem(
  workItemId: number,
  updates: Record<string, any>
): Promise<WorkItem> {
  try {
    const operations = Object.entries(updates).map(([field, value]) => ({
      op: 'replace',
      path: `/fields/${field}`,
      value,
    }));

    const response = await azureClient.patch(`/wit/workitems/${workItemId}`, operations, {
      params: { 'api-version': '7.0' },
    });

    return response.data;
  } catch (error: any) {
    const errorDetails = {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      workItemId,
      updates
    };
    console.error('Error updating work item:', JSON.stringify(errorDetails, null, 2));
    const errorMsg = error.response?.data?.message || error.response?.data?.value || error.message;
    throw new Error(`Failed to update work item ${workItemId}: ${errorMsg}`);
  }
}

/**
 * Deletes a work item
 * @param workItemId - ID of the work item to delete
 * @returns Success status
 */
export async function deleteWorkItem(workItemId: number): Promise<boolean> {
  try {
    await azureClient.delete(`/wit/workitems/${workItemId}`, {
      params: { 'api-version': '7.0' },
    });
    return true;
  } catch (error: any) {
    const errorDetails = {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      workItemId
    };
    console.error('Error deleting work item:', JSON.stringify(errorDetails, null, 2));
    const errorMsg = error.response?.data?.message || error.response?.data?.value || error.message;
    throw new Error(`Failed to delete work item ${workItemId}: ${errorMsg}`);
  }
}

/**
 * Gets a single work item by ID
 * @param workItemId - ID of the work item
 * @returns WorkItem object
 */
export async function getWorkItem(workItemId: number): Promise<WorkItem> {
  try {
    const response = await azureClient.get(`/wit/workitems/${workItemId}`, {
      params: { 'api-version': '7.0' },
    });
    return response.data;
  } catch (error: any) {
    const errorDetails = {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      workItemId
    };
    console.error('Error fetching work item:', JSON.stringify(errorDetails, null, 2));
    const errorMsg = error.response?.data?.message || error.response?.data?.value || error.message;
    throw new Error(`Failed to fetch work item ${workItemId}: ${errorMsg}`);
  }
}

/**
 * Updates work item state (e.g., 'New', 'Active', 'Done')
 * @param workItemId - ID of the work item
 * @param state - New state value
 * @returns Updated WorkItem object
 */
export async function updateWorkItemState(workItemId: number, state: string): Promise<WorkItem> {
  return updateWorkItem(workItemId, { 'System.State': state });
}

/**
 * Gets all tasks from the project
 * @returns Array of Task WorkItem objects
 */
export async function getAllTasks(): Promise<WorkItem[]> {
  try {
    // Use WIQL (Work Item Query Language) to query all tasks
    const wiqlQuery = {
      query: `SELECT [System.Id], [System.Title], [System.State], [System.AssignedTo] 
              FROM WorkItems 
              WHERE [System.TeamProject] = '${config.azure.project}' 
              AND [System.WorkItemType] = 'Task' 
              ORDER BY [System.CreatedDate] DESC`
    };

    const queryResponse = await azureClient.post('/wit/wiql', wiqlQuery, {
      params: { 'api-version': '7.0' },
    });

    const workItemIds = queryResponse.data.workItems?.map((wi: any) => wi.id) || [];

    if (workItemIds.length === 0) {
      return [];
    }

    // Fetch detailed work item data (max 200 at a time)
    const idsToFetch = workItemIds.slice(0, 200);
    const detailsResponse = await azureClient.get('/wit/workitems', {
      params: {
        ids: idsToFetch.join(','),
        'api-version': '7.0',
      },
    });

    return detailsResponse.data.value || [];
  } catch (error: any) {
    const errorDetails = {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    };
    console.error('Error fetching all tasks:', JSON.stringify(errorDetails, null, 2));
    const errorMsg = error.response?.data?.message || error.response?.data?.value || error.message;
    throw new Error(`Failed to fetch all tasks: ${errorMsg}`);
  }
}
