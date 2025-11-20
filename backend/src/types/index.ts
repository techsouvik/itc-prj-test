/**
 * Type definitions for Azure DevOps Sprint Manager
 */

// Azure DevOps Work Item
export interface WorkItem {
  id: number;
  rev: number;
  fields: {
    'System.Title': string;
    'System.State': string;
    'System.WorkItemType': string;
    'System.AssignedTo'?: {
      displayName: string;
      uniqueName: string;
    };
    'System.Description'?: string;
    'Microsoft.VSTS.Scheduling.RemainingWork'?: number;
    'Microsoft.VSTS.Scheduling.CompletedWork'?: number;
    'System.IterationPath'?: string;
  };
}

// Sprint/Iteration
export interface Sprint {
  id: string;
  name: string;
  path: string;
  attributes: {
    startDate?: string;
    finishDate?: string;
    timeFrame: 'past' | 'current' | 'future';
  };
}

// Sprint Metrics
export interface SprintMetrics {
  sprintId: string;
  sprintName: string;
  totalWorkItems: number;
  completedWorkItems: number;
  inProgressWorkItems: number;
  remainingWork: number;
  completedWork: number;
  velocity: number;
}

// AI Analysis Request
export interface AIAnalysisRequest {
  sprintData: SprintMetrics;
  workItems: WorkItem[];
  context?: string;
}

// AI Analysis Response
export interface AIAnalysisResponse {
  impact: string;
  recommendations: string[];
  riskLevel: 'low' | 'medium' | 'high';
  releaseReadiness: boolean;
  guidelines: string[];
}

// MCP Message
export interface MCPMessage {
  type: 'command' | 'query' | 'response';
  payload: unknown;
  timestamp: number;
}

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

// Configuration
export interface Config {
  azure: {
    orgUrl: string;
    project: string;
    pat: string;
  };
  server: {
    port: number;
    nodeEnv: string;
  };
  openRouter: {
    apiKey: string;
    model: string;
    baseUrl: string;
  };
  mcp: {
    enabled: boolean;
    serverUrl?: string;
  };
}
