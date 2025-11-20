/**
 * AI Integration Module
 * Connects to OpenRouter's DeepSeek API for sprint analysis and insights
 */

import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import { AIAnalysisRequest, AIAnalysisResponse, WorkItem } from '../types';

/**
 * OpenRouter API client
 */
const openRouterClient: AxiosInstance = axios.create({
  baseURL: config.openRouter.baseUrl,
  headers: {
    'Authorization': `Bearer ${config.openRouter.apiKey}`,
    'Content-Type': 'application/json',
  },
});

/**
 * Generates AI analysis prompt from sprint data
 * @param request - AI analysis request with sprint data
 * @returns Formatted prompt string
 */
function generateAnalysisPrompt(request: AIAnalysisRequest): string {
  const { sprintData, workItems } = request;
  
  const workItemSummary = workItems.map((item) => ({
    title: item.fields['System.Title'],
    state: item.fields['System.State'],
    type: item.fields['System.WorkItemType'],
  }));

  return `Analyze the following sprint data and provide insights:

Sprint: ${sprintData.sprintName}
Total Work Items: ${sprintData.totalWorkItems}
Completed: ${sprintData.completedWorkItems}
In Progress: ${sprintData.inProgressWorkItems}
Remaining Work: ${sprintData.remainingWork} hours
Completed Work: ${sprintData.completedWork} hours
Velocity: ${sprintData.velocity}

Work Items:
${JSON.stringify(workItemSummary, null, 2)}

Please provide:
1. Impact assessment of current sprint progress
2. Recommendations for improvement
3. Risk level (low/medium/high)
4. Release readiness assessment
5. Guidelines for the team

Format your response as JSON with keys: impact, recommendations (array), riskLevel, releaseReadiness (boolean), guidelines (array).`;
}

/**
 * Parses AI response and extracts structured data
 * @param aiResponse - Raw AI response text
 * @returns Structured AIAnalysisResponse
 */
function parseAIResponse(aiResponse: string): AIAnalysisResponse {
  try {
    // Try to extract JSON from the response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    // Fallback: create structured response from text
    return {
      impact: aiResponse,
      recommendations: ['Review AI response for detailed recommendations'],
      riskLevel: 'medium',
      releaseReadiness: false,
      guidelines: ['See full AI analysis for guidelines'],
    };
  } catch (error) {
    console.error('Error parsing AI response:', error);
    throw new Error('Failed to parse AI analysis response');
  }
}

/**
 * Analyzes sprint data using AI
 * @param request - Analysis request with sprint metrics and work items
 * @returns AI analysis response with insights
 */
export async function analyzeSprintWithAI(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
  try {
    const prompt = generateAnalysisPrompt(request);

    const response = await openRouterClient.post('/chat/completions', {
      model: config.openRouter.model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert Agile coach and sprint analyst. Provide concise, actionable insights.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const aiContent = response.data.choices[0]?.message?.content || '';
    return parseAIResponse(aiContent);
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    throw new Error('Failed to get AI analysis');
  }
}

/**
 * Gets AI recommendations for a specific work item
 * @param workItem - Work item to analyze
 * @returns AI recommendations as string
 */
export async function getWorkItemRecommendations(workItem: WorkItem): Promise<string> {
  try {
    const prompt = `Analyze this work item and provide recommendations:
    
Title: ${workItem.fields['System.Title']}
Type: ${workItem.fields['System.WorkItemType']}
State: ${workItem.fields['System.State']}
Description: ${workItem.fields['System.Description'] || 'N/A'}

Provide brief, actionable recommendations for completing this work item effectively.`;

    const response = await openRouterClient.post('/chat/completions', {
      model: config.openRouter.model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
    });

    return response.data.choices[0]?.message?.content || 'No recommendations available';
  } catch (error) {
    console.error('Error getting work item recommendations:', error);
    throw new Error('Failed to get AI recommendations');
  }
}
