/**
 * MCP Tool Handlers
 * Implementation of all MCP tool execution logic
 */

import * as sprintLoader from '../modules/sprintdataloader';
import * as workItemManager from '../modules/workitemmanager';
import * as aiIntegration from '../modules/integration';
import * as boardManager from '../modules/boardmanager';
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
        const allSprints = await sprintLoader.getSprints();
        // Return concise sprint info
        result = allSprints.map(s => ({
          id: s.id,
          name: s.name,
          path: s.path,
          timeFrame: s.attributes.timeFrame,
          startDate: s.attributes.startDate,
          finishDate: s.attributes.finishDate
        }));
        break;

      case 'get_sprint_work_items':
        if (!args.sprintId) {
          throw new Error('sprintId is required');
        }
        const sprintWorkItems = await sprintLoader.getSprintWorkItems(args.sprintId);
        // Return concise work item summaries
        result = sprintWorkItems.map(wi => ({
          id: wi.id,
          type: wi.fields['System.WorkItemType'],
          title: wi.fields['System.Title'],
          state: wi.fields['System.State'],
          assignedTo: wi.fields['System.AssignedTo']?.displayName || 'Unassigned'
        }));
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

      case 'get_all_tasks':
        const allTasks = await workItemManager.getAllTasks();
        // Return concise task info
        result = allTasks.map(task => ({
          id: task.id,
          title: task.fields['System.Title'],
          state: task.fields['System.State'],
          assignedTo: task.fields['System.AssignedTo']?.displayName || 'Unassigned'
        }));
        break;

      case 'get_boards':
        const boards = await boardManager.getBoards();
        // Return concise board info
        result = boards.map(b => ({
          id: b.id,
          name: b.name,
          url: b.url
        }));
        break;

      case 'get_board_columns':
        if (!args.boardId) {
          throw new Error('boardId is required');
        }
        const columns = await boardManager.getBoardColumns(args.boardId);
        // Return essential column info
        result = columns.map(c => ({
          id: c.id,
          name: c.name,
          itemLimit: c.itemLimit,
          columnType: c.columnType,
          stateMappings: c.stateMappings
        }));
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
    // Provide detailed error information for debugging
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}
