# Azure DevOps Sprint Manager with AI Integration

A fullstack TypeScript Express backend with Streamlit frontend for managing Azure Boards sprints, issues, and tasks, featuring AI-powered analysis via OpenRouter's DeepSeek API.

## ✨ Features

- **📊 Sprint Management**: View and track Azure DevOps sprints with real-time metrics
- **📝 Work Item CRUD**: Create, read, update, and delete work items (tasks, bugs, user stories)
- **🤖 AI Analysis**: Automated sprint impact assessment, risk analysis, and recommendations
- **🔄 Real-time Updates**: WebSocket support for live sprint and task updates
- **🔧 MCP Integration**: Optional Model Context Protocol server integration
- **🔐 Secure Configuration**: Environment-based configuration for all sensitive data

---

## 🏗️ Tech Stack

### Backend

- **TypeScript** - Type-safe JavaScript
- **Express** - Web framework
- **Socket.io** - Real-time WebSocket communication
- **Axios** - HTTP client for Azure DevOps and OpenRouter APIs
- **dotenv** - Environment variable management

### Frontend

- **Streamlit** - Python web framework for data apps
- **Requests** - HTTP client for backend API

### Integrations

- **Azure DevOps REST API** - Sprint and work item management
- **OpenRouter DeepSeek API** - AI-powered insights and analysis

---

## 📁 Project Structure

```
itc-prj-test/
├── backend/                    # TypeScript Express backend
│   ├── src/
│   │   ├── config/            # Configuration loader
│   │   ├── modules/           # Core business logic modules
│   │   │   ├── sprintdataloader.ts    # Azure DevOps sprint data
│   │   │   ├── workitemmanager.ts     # Work item CRUD
│   │   │   ├── integration.ts         # AI integration
│   │   │   └── mcpserver.ts           # MCP integration
│   │   ├── routes/            # API route definitions
│   │   ├── types/             # TypeScript type definitions
│   │   └── main.server.ts     # Server entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── frontend/                   # Streamlit frontend
│   ├── utils/
│   │   └── api_client.py      # Backend API client
│   ├── app.py                 # Main Streamlit application
│   ├── requirements.txt
│   └── .env.example
│
├── mcp.json                   # MCP server configuration
├── .gitignore
├── Readme.md
└── plan.md
```

---

## 🚀 Setup & Installation

### Prerequisites

- **Node.js** v16+ and npm
- **Python** 3.9+ and pip
- **Azure DevOps** account with Personal Access Token (PAT)
- **OpenRouter** API key

### Backend Setup

1. **Navigate to backend directory**:

   ```bash
   cd backend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure environment variables**:

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your credentials:

   ```env
   AZURE_ORG_URL=https://dev.azure.com/your-organization
   AZURE_PROJECT=YourProjectName
   AZURE_PAT=your-personal-access-token

   PORT=3000
   NODE_ENV=development

   OPENROUTER_API_KEY=your-openrouter-api-key
   OPENROUTER_MODEL=deepseek/deepseek-chat
   OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

   MCP_ENABLED=false
   ```

4. **Build TypeScript**:

   ```bash
   npm run build
   ```

5. **Start development server**:

   ```bash
   npm run dev
   ```

   Or for production:

   ```bash
   npm start
   ```

The backend will start on `http://localhost:3000`

### Frontend Setup

1. **Navigate to frontend directory**:

   ```bash
   cd frontend
   ```

2. **Install Python dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**:

   ```bash
   cp .env.example .env
   ```

   Edit `.env`:

   ```env
   BACKEND_API_URL=http://localhost:3000
   ```

4. **Run Streamlit app**:
   ```bash
   streamlit run app.py
   ```

The frontend will open in your browser at `http://localhost:8501`

---

## 📖 Usage

### Dashboard

- View current sprint metrics (total items, completed, in progress)
- Track completion rate and velocity
- Monitor remaining and completed work hours

### Work Item Management

- Create new work items (tasks, bugs, user stories, features)
- View all work items in the current sprint
- Update work item status and details
- Delete work items

### AI Analysis

- Get AI-powered sprint impact assessment
- Receive actionable recommendations
- View risk level analysis (low/medium/high)
- Check release readiness status
- Access team guidelines

### MCP Controls

- Check MCP server status
- Send commands to MCP server
- Execute queries against MCP

---

## 🔌 API Endpoints

### Sprints

- `GET /api/sprints` - Get all sprints
- `GET /api/sprints/:sprintId/workitems` - Get work items for a sprint
- `GET /api/sprints/current/metrics` - Get current sprint metrics

### Work Items

- `POST /api/workitems` - Create work item
- `GET /api/workitems/:id` - Get work item by ID
- `PATCH /api/workitems/:id` - Update work item
- `DELETE /api/workitems/:id` - Delete work item

### AI Analysis

- `POST /api/ai/analyze-sprint` - Analyze sprint with AI
- `POST /api/ai/workitem-recommendations` - Get work item recommendations

### MCP

- `GET /api/mcp/status` - Get MCP server status
- `POST /api/mcp/command` - Send MCP command
- `POST /api/mcp/query` - Query MCP server

### Health

- `GET /health` - Backend health check

---

## 🔐 Security Notes

- Never commit `.env` files to version control
- Keep your Azure PAT and OpenRouter API key secure
- Use environment variables for all sensitive configuration
- In production, configure CORS appropriately in `main.server.ts`

---

## 🛠️ Development

### Backend Development

```bash
cd backend
npm run dev  # Runs with hot-reload using ts-node-dev
```

### Build for Production

```bash
cd backend
npm run build  # Compiles TypeScript to JavaScript in dist/
npm start      # Runs compiled code
```

### Linting

```bash
cd backend
npm run lint
```

---

## 📝 Environment Variables

### Backend (.env)

| Variable              | Description                          | Required |
| --------------------- | ------------------------------------ | -------- |
| `AZURE_ORG_URL`       | Azure DevOps organization URL        | Yes      |
| `AZURE_PROJECT`       | Azure DevOps project name            | Yes      |
| `AZURE_PAT`           | Personal Access Token                | Yes      |
| `PORT`                | Server port (default: 3000)          | No       |
| `NODE_ENV`            | Environment (development/production) | No       |
| `OPENROUTER_API_KEY`  | OpenRouter API key                   | Yes      |
| `OPENROUTER_MODEL`    | AI model name                        | No       |
| `OPENROUTER_BASE_URL` | OpenRouter API base URL              | No       |
| `MCP_ENABLED`         | Enable MCP integration (true/false)  | No       |
| `MCP_SERVER_URL`      | MCP server URL                       | No       |

### Frontend (.env)

| Variable          | Description     | Required |
| ----------------- | --------------- | -------- |
| `BACKEND_API_URL` | Backend API URL | Yes      |

---

## 🤝 Contributing

Contributions are welcome! Please see `plan.md` for module layout and roadmap.

---

## 📄 License

MIT

---

## 🆘 Troubleshooting

### Backend won't start

- Verify all required environment variables are set in `.env`
- Check that Azure PAT has proper permissions
- Ensure OpenRouter API key is valid

### Frontend can't connect to backend

- Verify backend is running on the correct port
- Check `BACKEND_API_URL` in frontend `.env`
- Ensure CORS is properly configured

### AI analysis fails

- Verify OpenRouter API key is valid
- Check API quota and rate limits
- Review backend logs for detailed error messages

---

**Built with ❤️ using TypeScript, Express, and Streamlit**
