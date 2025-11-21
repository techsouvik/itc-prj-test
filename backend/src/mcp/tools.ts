/**
 * MCP Tools Registry
 * Defines all available MCP tools for Azure DevOps Sprint Manager
 */

import { MCPTool } from './types';

export const MCP_TOOLS: MCPTool[] = [
  {
    name: 'get_sprints',
    description: 'List all sprints with ID, name, path, timeFrame, and dates',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_sprint_work_items',
    description: 'Get work items for a sprint (returns ID, type, title, state, assignee)',
    inputSchema: {
      type: 'object',
      properties: {
        sprintId: {
          type: 'string',
          description: 'Sprint ID from get_sprints',
        },
      },
      required: ['sprintId'],
    },
  },
  {
    name: 'get_current_sprint_metrics',
    description: 'Get current sprint metrics: total items, completed, in progress, completion rate, velocity, work hours',
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
    description: 'Update work item fields (state, title, description, assignedTo, etc.)',
    inputSchema: {
      type: 'object',
      properties: {
        workItemId: {
          type: 'number',
          description: 'Work item ID',
        },
        updates: {
          type: 'object',
          description: 'Fields: System.State, System.Title, System.Description, System.AssignedTo',
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
    description: 'AI analysis of current sprint: impact assessment, recommendations, risk level, release readiness',
    inputSchema: {
      type: 'object',
      properties: {
        context: {
          type: 'string',
          description: 'Optional context for analysis',
        },
      },
      required: [],
    },
  },
  {
    name: 'get_all_tasks',
    description: 'Get all tasks from the project (returns id, type, title, state, assignee)',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_boards',
    description: 'List all boards for the project',
    inputSchema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'get_board_columns',
    description: 'Get columns for a board (returns id, name, itemLimit, columnType, stateMappings)',
    inputSchema: {
      type: 'object',
      properties: {
        boardId: {
          type: 'string',
          description: 'Board ID or name from get_boards',
        },
      },
      required: ['boardId'],
    },
  },
];
