#!/usr/bin/env node
/**
 * MCP Server Entry Point
 * Implements Model Context Protocol (MCP) for Cline integration
 * Uses stdio for communication
 */

// CRITICAL: Redirect all console.log to stderr to prevent corrupting stdout
const originalLog = console.log;
console.log = (...args: any[]) => {
  console.error(...args);
};

import { config } from '../config';
import { MCPRequest, MCPResponse, MCPError } from './types';
import { MCP_TOOLS } from './tools';
import { executeToolCall } from './handlers';

/**
 * Send JSON-RPC response to stdout
 */
function sendResponse(response: MCPResponse): void {
  originalLog(JSON.stringify(response));
}

/**
 * Send error response
 */
function sendError(id: string | number, code: number, message: string, data?: any): void {
  const error: MCPError = { code, message, data };
  sendResponse({
    jsonrpc: '2.0',
    id,
    error,
  });
}

/**
 * Handle MCP request
 */
async function handleRequest(request: MCPRequest): Promise<void> {
  const { id, method, params } = request;

  try {
    switch (method) {
      case 'initialize':
        // Initialize MCP server - always respond
        sendResponse({
          jsonrpc: '2.0',
          id: id || 0,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: {
              tools: {},
            },
            serverInfo: {
              name: 'azure-devops-sprint-manager',
              version: '1.0.0',
            },
          },
        });
        break;

      case 'initialized':
        // Acknowledge initialization complete
        // No response needed for notification
        break;

      case 'tools/list':
        // Return list of available tools - always respond
        sendResponse({
          jsonrpc: '2.0',
          id: id || 0,
          result: {
            tools: MCP_TOOLS,
          },
        });
        break;

      case 'tools/call':
        // Execute tool call
        if (!params || !params.name) {
          sendError(id || 0, -32602, 'Invalid params: name is required');
          return;
        }

        const toolResult = await executeToolCall({
          name: params.name,
          arguments: params.arguments || {},
        });

        sendResponse({
          jsonrpc: '2.0',
          id: id || 0,
          result: toolResult,
        });
        break;

      default:
        sendError(id || 0, -32601, `Method not found: ${method}`);
    }
  } catch (error: any) {
    console.error('Error handling request:', error);
    sendError(id || 0, -32603, 'Internal error', error.message);
  }
}

/**
 * Main server loop - read from stdin, process requests
 */
async function main(): Promise<void> {
  // Log to stderr (stdout is reserved for MCP protocol)
  console.error('Azure DevOps Sprint Manager - MCP Server');
  console.error('=========================================');
  console.error(`Environment: ${config.server.nodeEnv}`);
  console.error(`Azure Org: ${config.azure.orgUrl}`);
  console.error(`Project: ${config.azure.project}`);
  console.error('MCP Server ready for requests...');
  console.error('=========================================');

  let buffer = '';

  // Read from stdin
  process.stdin.setEncoding('utf8');
  
  process.stdin.on('data', async (chunk: string) => {
    buffer += chunk;
    
    // Process complete JSON objects
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.trim()) {
        try {
          const request: MCPRequest = JSON.parse(line);
          await handleRequest(request);
        } catch (error: any) {
          console.error('Error parsing request:', error.message);
          sendError('unknown', -32700, 'Parse error');
        }
      }
    }
  });

  process.stdin.on('end', () => {
    console.error('MCP Server shutting down...');
    process.exit(0);
  });

  // Handle errors
  process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    console.error('Unhandled rejection:', reason);
    process.exit(1);
  });
}

// Start the MCP server
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
