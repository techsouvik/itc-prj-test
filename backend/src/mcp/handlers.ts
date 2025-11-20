/**
 * MCP Tool Handlers
 * Implementation of all MCP tool execution logic
 */

import * as sprintLoader from '../modules/sprintdataloader';
import * as workItemManager from '../modules/workitemmanager';
import * as aiIntegration from '../modules/integration';
import { MCPToolCallRequest, MCPToolCallResponse } from './types';

/**
 * Execute an MCP tool call
 */
export async function executeToolCall(request: MCPToolCallRequest): Promise<MCPToolCallResponse> {
  try {
    const { name, arguments: args } = request;

    let result: any;

    switch (name) {
      case 'get_sprints':
        result = await sprintLoader.getSprints();
        break;

      case 'get_sprint_work_items':
        if (!args.sprintId) {
          throw new Error('sprintId is required');
        }
        result = await sprintLoader.getSprintWorkItems(args.sprintId);
        break;

      case 'get_current_sprint_metrics':
        result = await sprintLoader.getCurrentSprintMetrics();
        break;

      case 'create_work_item':
        if (!args.workItemType || !args.title) {
          throw new Error('workItemType and title are required');
        }
        result = await workItemManager.createWorkItem(
          args.workItemType,
          args.title,
          args.description,
          args.assignedTo
        );
        // Return only essential info to reduce context
        result = {
          id: result.id,
          type: result.fields['System.WorkItemType'],
          title: result.fields['System.Title'],
          state: result.fields['System.State'],
          url: `https://dev.azure.com/${process.env.AZURE_ORG_URL?.split('/').pop()}/${process.env.AZURE_PROJECT}/_workitems/edit/${result.id}`
        };
        break;

      case 'update_work_item':
        if (!args.workItemId || !args.updates) {
          throw new Error('workItemId and updates are required');
        }
        result = await workItemManager.updateWorkItem(args.workItemId, args.updates);
        // Return only essential info
        result = {
          id: result.id,
          title: result.fields['System.Title'],
          state: result.fields['System.State'],
          updated: true
        };
        break;

      case 'get_work_item':
        if (!args.workItemId) {
          throw new Error('workItemId is required');
        }
        result = await workItemManager.getWorkItem(args.workItemId);
        // Return concise info
        result = {
          id: result.id,
          type: result.fields['System.WorkItemType'],
          title: result.fields['System.Title'],
          state: result.fields['System.State'],
          assignedTo: result.fields['System.AssignedTo']?.displayName || 'Unassigned',
          description: result.fields['System.Description']?.substring(0, 200) || ''
        };
        break;

      case 'analyze_sprint_with_ai':
        // Get current sprint metrics and work items
        const metrics = await sprintLoader.getCurrentSprintMetrics();
        if (!metrics) {
          throw new Error('No active sprint found');
        }

        const sprints = await sprintLoader.getSprints();
        const currentSprint = sprints.find((s) => s.attributes.timeFrame === 'current');
        if (!currentSprint) {
          throw new Error('No current sprint found');
        }

        const workItems = await sprintLoader.getSprintWorkItems(currentSprint.id);
        result = await aiIntegration.analyzeSprintWithAI({
          sprintData: metrics,
          workItems,
          context: args.context,
        });
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
}
