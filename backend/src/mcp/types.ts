/**
 * MCP Protocol Types
 * Type definitions for Model Context Protocol (MCP) communication
 */

// MCP Request/Response types
export interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, any>;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: MCPError;
}

export interface MCPError {
  code: number;
  message: string;
  data?: any;
}

// MCP Tool Definition
export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

// MCP Tool List Response
export interface MCPToolListResponse {
  tools: MCPTool[];
}

// MCP Tool Call Request
export interface MCPToolCallRequest {
  name: string;
  arguments: Record<string, any>;
}

// MCP Tool Call Response
export interface MCPToolCallResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}
