/**
 * API Routes
 * Defines all REST API endpoints for the application
 */

import { Router, Request, Response } from 'express';
import * as sprintLoader from '../modules/sprintdataloader';
import * as workItemManager from '../modules/workitemmanager';
import * as aiIntegration from '../modules/integration';
import * as mcpServer from '../modules/mcpserver';
import { ApiResponse } from '../types';

const router = Router();

/**
 * Helper function to create API response
 */
function createResponse<T>(success: boolean, data?: T, error?: string): ApiResponse<T> {
  return {
    success,
    data,
    error,
    timestamp: Date.now(),
  };
}

// ============ Sprint Routes ============

/**
 * GET /api/sprints
 * Fetches all sprints
 */
router.get('/sprints', async (_req: Request, res: Response) => {
  try {
    const sprints = await sprintLoader.getSprints();
    res.json(createResponse(true, sprints));
  } catch (error: any) {
    res.status(500).json(createResponse(false, undefined, error.message));
  }
});

/**
 * GET /api/sprints/:sprintId/workitems
 * Fetches work items for a specific sprint
 */
router.get('/sprints/:sprintId/workitems', async (req: Request, res: Response) => {
  try {
    const { sprintId } = req.params;
    const workItems = await sprintLoader.getSprintWorkItems(sprintId);
    res.json(createResponse(true, workItems));
  } catch (error: any) {
    res.status(500).json(createResponse(false, undefined, error.message));
  }
});

/**
 * GET /api/sprints/current/metrics
 * Fetches metrics for the current sprint
 */
router.get('/sprints/current/metrics', async (_req: Request, res: Response) => {
  try {
    const metrics = await sprintLoader.getCurrentSprintMetrics();
    res.json(createResponse(true, metrics));
  } catch (error: any) {
    res.status(500).json(createResponse(false, undefined, error.message));
  }
});

// ============ Work Item Routes ============

/**
 * POST /api/workitems
 * Creates a new work item
 */
router.post('/workitems', async (req: Request, res: Response) => {
  try {
    const { workItemType, title, description, assignedTo } = req.body;
    const workItem = await workItemManager.createWorkItem(workItemType, title, description, assignedTo);
    res.json(createResponse(true, workItem));
  } catch (error: any) {
    res.status(500).json(createResponse(false, undefined, error.message));
  }
});

/**
 * GET /api/workitems/:id
 * Gets a specific work item
 */
router.get('/workitems/:id', async (req: Request, res: Response) => {
  try {
    const workItemId = parseInt(req.params.id, 10);
    const workItem = await workItemManager.getWorkItem(workItemId);
    res.json(createResponse(true, workItem));
  } catch (error: any) {
    res.status(500).json(createResponse(false, undefined, error.message));
  }
});

/**
 * PATCH /api/workitems/:id
 * Updates a work item
 */
router.patch('/workitems/:id', async (req: Request, res: Response) => {
  try {
    const workItemId = parseInt(req.params.id, 10);
    const { updates } = req.body;
    const workItem = await workItemManager.updateWorkItem(workItemId, updates);
    res.json(createResponse(true, workItem));
  } catch (error: any) {
    res.status(500).json(createResponse(false, undefined, error.message));
  }
});

/**
 * DELETE /api/workitems/:id
 * Deletes a work item
 */
router.delete('/workitems/:id', async (req: Request, res: Response) => {
  try {
    const workItemId = parseInt(req.params.id, 10);
    await workItemManager.deleteWorkItem(workItemId);
    res.json(createResponse(true, { deleted: true }));
  } catch (error: any) {
    res.status(500).json(createResponse(false, undefined, error.message));
  }
});

// ============ AI Analysis Routes ============

/**
 * POST /api/ai/analyze-sprint
 * Analyzes sprint data with AI
 */
router.post('/ai/analyze-sprint', async (req: Request, res: Response) => {
  try {
    const { sprintData, workItems, context } = req.body;
    const analysis = await aiIntegration.analyzeSprintWithAI({ sprintData, workItems, context });
    res.json(createResponse(true, analysis));
  } catch (error: any) {
    res.status(500).json(createResponse(false, undefined, error.message));
  }
});

/**
 * POST /api/ai/workitem-recommendations
 * Gets AI recommendations for a work item
 */
router.post('/ai/workitem-recommendations', async (req: Request, res: Response) => {
  try {
    const { workItem } = req.body;
    const recommendations = await aiIntegration.getWorkItemRecommendations(workItem);
    res.json(createResponse(true, { recommendations }));
  } catch (error: any) {
    res.status(500).json(createResponse(false, undefined, error.message));
  }
});

// ============ MCP Routes ============

/**
 * GET /api/mcp/status
 * Gets MCP server status
 */
router.get('/mcp/status', async (_req: Request, res: Response) => {
  try {
    const status = await mcpServer.getMCPStatus();
    res.json(createResponse(true, status));
  } catch (error: any) {
    res.status(500).json(createResponse(false, undefined, error.message));
  }
});

/**
 * POST /api/mcp/command
 * Sends a command to MCP server
 */
router.post('/mcp/command', async (req: Request, res: Response) => {
  try {
    const { command, payload } = req.body;
    const response = await mcpServer.sendMCPCommand(command, payload);
    res.json(createResponse(true, response));
  } catch (error: any) {
    res.status(500).json(createResponse(false, undefined, error.message));
  }
});

/**
 * POST /api/mcp/query
 * Queries MCP server
 */
router.post('/mcp/query', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;
    const response = await mcpServer.queryMCP(query);
    res.json(createResponse(true, response));
  } catch (error: any) {
    res.status(500).json(createResponse(false, undefined, error.message));
  }
});

export default router;
