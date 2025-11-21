/**
 * Board Manager Module
 * Handles operations for Azure DevOps boards and columns
 */

import axios, { AxiosInstance } from 'axios';
import { config } from '../config';

/**
 * Board reference interface
 */
export interface BoardReference {
  id: string;
  name: string;
  url: string;
}

/**
 * Board column interface
 */
export interface BoardColumn {
  id: string;
  name: string;
  itemLimit: number;
  stateMappings: Record<string, string>;
  columnType: string;
  isSplit?: boolean;
  description?: string;
}

/**
 * Azure DevOps API client for board operations
 */
const azureClient: AxiosInstance = axios.create({
  baseURL: `${config.azure.orgUrl}/${config.azure.project}`,
  auth: {
    username: '',
    password: config.azure.pat,
  },
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Gets all boards for the default team
 * @returns Array of BoardReference objects
 */
export async function getBoards(): Promise<BoardReference[]> {
  try {
    // Use project name as team name (common default)
    const team = config.azure.project;
    const response = await azureClient.get(`/${team}/_apis/work/boards`, {
      params: { 'api-version': '7.1' },
    });

    return response.data.value || [];
  } catch (error: any) {
    const errorDetails = {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    };
    console.error('Error fetching boards:', JSON.stringify(errorDetails, null, 2));
    const errorMsg = error.response?.data?.message || error.response?.data?.value || error.message;
    throw new Error(`Failed to fetch boards: ${errorMsg}`);
  }
}

/**
 * Gets columns for a specific board
 * @param boardId - Board ID or name
 * @returns Array of BoardColumn objects
 */
export async function getBoardColumns(boardId: string): Promise<BoardColumn[]> {
  try {
    // Use project name as team name (common default)
    const team = config.azure.project;
    const response = await azureClient.get(`/${team}/_apis/work/boards/${boardId}/columns`, {
      params: { 'api-version': '7.1' },
    });

    return response.data.value || [];
  } catch (error: any) {
    const errorDetails = {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      boardId,
    };
    console.error('Error fetching board columns:', JSON.stringify(errorDetails, null, 2));
    const errorMsg = error.response?.data?.message || error.response?.data?.value || error.message;
    throw new Error(`Failed to fetch columns for board ${boardId}: ${errorMsg}`);
  }
}
