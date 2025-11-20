# Project Technical Plan

## Objectives

- Enable streamlined management of Azure Boards sprints, issues, and tasks using a backend API with Node.js/Express.
- Integrate AI-driven insights and analysis using OpenRouter’s DeepSeek API.
- Provide an intuitive frontend (Streamlit) for sprint visualization, work item management, and impact analysis.
- Ensure environment configuration is secure and flexible via `.env`.

---

## Backend (Node.js + Express)

### Modules

- **main.server.js**: Entry-point. Boots up Express server, WebSocket (socket.io), and routes.
- **sprintdataloader.js**: Fetches sprint data, work items, current/past sprint metrics from Azure DevOps REST API.
- **workitemmanager.js**: Handles work item CRUD operations—issue/task creation, update, removal.
- **integration.js**: Connects backend logic to OpenRouter’s DeepSeek AI API: sends board data for analysis/guidelines.
- **mcpserver.js**: Manages integration and communication with the local MCP (Management Control Point) server.
- **mcp.json**: Holds MCP-related config.

### Environment Configuration

`.env` stores:

- AZURE_ORG_URL
- AZURE_PROJECT
- AZURE_PAT
- PORT
- OPENROUTER_API_KEY
- OPENROUTER_MODEL
- OPENROUTER_BASE_URL

### Key Libraries

- express
- axios
- dotenv
- socket.io

### Key Features

- Secure, tokenized API communication with Azure DevOps and AI services.
- Modular architecture for maintainability and extensibility.
- WebSocket for live sprint/task updates.

---

## Frontend (Streamlit)

- **app.py**: Live dashboard for sprints, issues, tasks; triggers AI analysis; shows impact/guidelines.
- Connects to backend via REST API endpoints.
- UI for:
  - Sprint summaries (current/past)
  - Task management (CRUD)
  - AI impact analysis (actionable insights)
  - MCP controls

Optional: Use CSS or native Streamlit theming for custom styling.

---

## Integration Flow

1. Backend fetches/upserts Azure Boards data (sprints, work items).
2. Frontend pulls data (via REST) and offers UI controls.
3. AI endpoints provide insights/guidelines based on sprint/project state.
4. Local MCP server integration for advanced org-level management.

---

## Production Considerations

- Secure API keys and PAT using environment vars and access controls.
- Validate and sanitize user input (backend).
- Implement error monitoring/logging.
- Prepare for localization/region compliance.
- Write deployment/documentation guides for onboarding.

---

## Sprint Analysis Process

- Fetch metrics per sprint.
- Run AI analysis for impact and recommendations.
- Archive data for audits and release planning.
