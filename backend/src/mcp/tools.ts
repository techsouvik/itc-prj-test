/**
 * MCP Tools Registry
 * Defines all available MCP tools for Azure DevOps Sprint Manager
 */

import { MCPTool } from './types';

export const MCP_TOOLS: MCPTool[] = [
  {
    name: 'get_sprints',
    description: 'Get all sprints/iterations from Azure DevOps project',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_sprint_work_items',
    description: 'Get all work items for a specific sprint',
    inputSchema: {
      type: 'object',
      properties: {
        sprintId: {
          type: 'string',
          description: 'The ID of the sprint',
        },
      },
      required: ['sprintId'],
    },
  },
  {
    name: 'get_current_sprint_metrics',
    description: 'Get metrics for the current active sprint including completion rate, velocity, and work hours',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'create_work_item',
    description: 'Create a new work item (task, bug, user story, or feature) in Azure DevOps',
    inputSchema: {
      type: 'object',
      properties: {
        workItemType: {
          type: 'string',
          description: 'Type of work item: Task, Bug, User Story, or Feature',
          enum: ['Task', 'Bug', 'User Story', 'Feature'],
        },
        title: {
          type: 'string',
          description: 'Title of the work item',
        },
        description: {
          type: 'string',
          description: 'Detailed description of the work item (optional)',
        },
        assignedTo: {
          type: 'string',
          description: 'Email of the person to assign the work item to (optional)',
        },
      },
      required: ['workItemType', 'title'],
    },
  },
  {
    name: 'update_work_item',
    description: 'Update an existing work item in Azure DevOps',
    inputSchema: {
      type: 'object',
      properties: {
        workItemId: {
          type: 'number',
          description: 'ID of the work item to update',
        },
        updates: {
          type: 'object',
          description: 'Fields to update (e.g., {"System.State": "Active", "System.Title": "New title"})',
        },
      },
      required: ['workItemId', 'updates'],
    },
  },
  {
    name: 'get_work_item',
    description: 'Get details of a specific work item by ID',
    inputSchema: {
      type: 'object',
      properties: {
        workItemId: {
          type: 'number',
          description: 'ID of the work item',
        },
      },
      required: ['workItemId'],
    },
  },
  {
    name: 'analyze_sprint_with_ai',
    description: 'Analyze current sprint with AI to get impact assessment, recommendations, risk level, and release readiness',
    inputSchema: {
      type: 'object',
      properties: {
        context: {
          type: 'string',
          description: 'Additional context for the AI analysis (optional)',
        },
      },
      required: [],
    },
  },
];
