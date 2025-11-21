/**
 * Sprint Data Loader Module
 * Fetches sprint data, work items, and metrics from Azure DevOps REST API
 */

import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import { Sprint, WorkItem, SprintMetrics } from '../types';

/**
 * Azure DevOps API client with authentication
 */
const azureClient: AxiosInstance = axios.create({
  baseURL: `${config.azure.orgUrl}/${config.azure.project}/_apis`,
  auth: {
    username: '',
    password: config.azure.pat,
  },
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetches all sprints/iterations for the project
 * @returns Array of Sprint objects
 */
export async function getSprints(): Promise<Sprint[]> {
  try {
    const response = await azureClient.get('/work/teamsettings/iterations', {
      params: { 'api-version': '7.0' },
    });
    return response.data.value;
  } catch (error) {
    console.error('Error fetching sprints:', error);
    throw new Error('Failed to fetch sprints from Azure DevOps');
  }
}

/**
 * Fetches work items for a specific sprint
 * @param sprintId - The sprint iteration ID
 * @returns Array of WorkItem objects
 */
export async function getSprintWorkItems(sprintId: string): Promise<WorkItem[]> {
  try {
    console.log(`Fetching work items for sprint: ${sprintId}`);
    
    // Get work item IDs for the sprint
    const response = await azureClient.get(`/work/teamsettings/iterations/${sprintId}/workitems`, {
      params: { 'api-version': '7.0' },
    });

    const workItemRefs = response.data.workItemRelations || [];
    console.log(`Found ${workItemRefs.length} work item references for sprint ${sprintId}`);
    
    const workItemIds = workItemRefs
      .filter((ref: any) => ref.target)
      .map((ref: any) => ref.target.id);

    if (workItemIds.length === 0) {
      console.log(`No work items found for sprint ${sprintId}`);
      return [];
    }

    console.log(`Fetching details for ${workItemIds.length} work items`);
    
    // Fetch detailed work item data
    const detailsResponse = await azureClient.get('/wit/workitems', {
      params: {
        ids: workItemIds.join(','),
        'api-version': '7.0',
      },
    });

    const workItems = detailsResponse.data.value || [];
    console.log(`Retrieved ${workItems.length} work items for sprint ${sprintId}`);
    
    return workItems;
  } catch (error: any) {
    const errorDetails = {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      sprintId,
    };
    console.error('Error fetching sprint work items:', JSON.stringify(errorDetails, null, 2));
    const errorMsg = error.response?.data?.message || error.response?.data?.value || error.message;
    throw new Error(`Failed to fetch work items for sprint ${sprintId}: ${errorMsg}`);
  }
}

/**
 * Calculates sprint metrics from work items
 * @param sprint - Sprint object
 * @param workItems - Array of work items in the sprint
 * @returns SprintMetrics object
 */
export function calculateSprintMetrics(sprint: Sprint, workItems: WorkItem[]): SprintMetrics {
  const completed = workItems.filter((item) => item.fields['System.State'] === 'Done' || item.fields['System.State'] === 'Closed');
  const inProgress = workItems.filter((item) => item.fields['System.State'] === 'Active' || item.fields['System.State'] === 'In Progress');

  const totalRemaining = workItems.reduce((sum, item) => sum + (item.fields['Microsoft.VSTS.Scheduling.RemainingWork'] || 0), 0);
  const totalCompleted = workItems.reduce((sum, item) => sum + (item.fields['Microsoft.VSTS.Scheduling.CompletedWork'] || 0), 0);

  return {
    sprintId: sprint.id,
    sprintName: sprint.name,
    totalWorkItems: workItems.length,
    completedWorkItems: completed.length,
    inProgressWorkItems: inProgress.length,
    remainingWork: totalRemaining,
    completedWork: totalCompleted,
    velocity: totalCompleted,
  };
}

/**
 * Fetches current sprint with metrics
 * @returns Sprint metrics for the current sprint
 */
export async function getCurrentSprintMetrics(): Promise<SprintMetrics | null> {
  try {
    const sprints = await getSprints();
    const currentSprint = sprints.find((s) => s.attributes.timeFrame === 'current');

    if (!currentSprint) {
      return null;
    }

    const workItems = await getSprintWorkItems(currentSprint.id);
    return calculateSprintMetrics(currentSprint, workItems);
  } catch (error) {
    console.error('Error fetching current sprint metrics:', error);
    throw error;
  }
}
