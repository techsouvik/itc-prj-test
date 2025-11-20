/**
 * MCP Server Module
 * Manages integration with Model Context Protocol (MCP) server
 */

import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import { MCPMessage } from '../types';

/**
 * MCP client instance (only created if MCP is enabled)
 */
let mcpClient: AxiosInstance | null = null;

/**
 * Initializes MCP client if enabled in configuration
 */
function initializeMCPClient(): void {
  if (config.mcp.enabled && config.mcp.serverUrl) {
    mcpClient = axios.create({
      baseURL: config.mcp.serverUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    });
    console.log('MCP client initialized');
  } else {
    console.log('MCP integration disabled');
  }
}

// Initialize on module load
initializeMCPClient();

/**
 * Checks if MCP is enabled and client is available
 * @returns True if MCP is ready to use
 */
export function isMCPEnabled(): boolean {
  return mcpClient !== null;
}

/**
 * Sends a command to the MCP server
 * @param command - Command name
 * @param payload - Command payload
 * @returns MCP response
 */
export async function sendMCPCommand(command: string, payload: any): Promise<MCPMessage> {
  if (!mcpClient) {
    throw new Error('MCP is not enabled or configured');
  }

  try {
    const message: MCPMessage = {
      type: 'command',
      payload: { command, ...payload },
      timestamp: Date.now(),
    };

    const response = await mcpClient.post('/command', message);
    return response.data;
  } catch (error) {
    console.error('Error sending MCP command:', error);
    throw new Error('Failed to send MCP command');
  }
}

/**
 * Queries the MCP server for data
 * @param query - Query string
 * @returns MCP response with query results
 */
export async function queryMCP(query: string): Promise<MCPMessage> {
  if (!mcpClient) {
    throw new Error('MCP is not enabled or configured');
  }

  try {
    const message: MCPMessage = {
      type: 'query',
      payload: { query },
      timestamp: Date.now(),
    };

    const response = await mcpClient.post('/query', message);
    return response.data;
  } catch (error) {
    console.error('Error querying MCP:', error);
    throw new Error('Failed to query MCP server');
  }
}

/**
 * Gets MCP server status
 * @returns Server status information
 */
export async function getMCPStatus(): Promise<{ online: boolean; version?: string }> {
  if (!mcpClient) {
    return { online: false };
  }

  try {
    const response = await mcpClient.get('/status');
    return {
      online: true,
      version: response.data.version,
    };
  } catch (error) {
    console.error('Error getting MCP status:', error);
    return { online: false };
  }
}
