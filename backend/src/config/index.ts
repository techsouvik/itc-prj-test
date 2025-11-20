/**
 * Configuration loader and validator
 * Loads environment variables and provides type-safe config object
 */

import dotenv from 'dotenv';
import { Config } from '../types';

// Load environment variables from .env file
dotenv.config();



/**
 * Application configuration object
 * Provides type-safe access to environment variables
 */
export const config: Config = {
  azure: {
    orgUrl: process.env.AZURE_ORG_URL!,
    project: process.env.AZURE_PROJECT!,
    pat: process.env.AZURE_PAT!,
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  openRouter: {
    apiKey: process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY || '',
    model: process.env.OPENROUTER_MODEL || process.env.OPENAI_MODEL || 'gpt-4',
    baseUrl: process.env.OPENROUTER_BASE_URL || process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  },
  mcp: {
    enabled: process.env.MCP_ENABLED === 'true',
    serverUrl: process.env.MCP_SERVER_URL,
  },
};
