# Quick Start Guide

## Prerequisites Check

Before starting, ensure you have configured your environment variables:

### Backend Configuration (backend/.env)

You need to update the following values in `backend/.env`:

```bash
# Required: Your Azure DevOps organization URL
AZURE_ORG_URL=https://dev.azure.com/your-organization

# Required: Your Azure DevOps project name
AZURE_PROJECT=YourProjectName

# Required: Your Azure Personal Access Token
AZURE_PAT=your-personal-access-token-here

# Required: Your OpenRouter API key
OPENROUTER_API_KEY=your-openrouter-api-key-here
```

### How to Get Credentials

**Azure DevOps PAT:**

1. Go to https://dev.azure.com/your-organization
2. Click on User Settings (top right) → Personal Access Tokens
3. Create new token with "Work Items (Read, Write)" permissions
4. Copy the token to `AZURE_PAT`

**OpenRouter API Key:**

1. Sign up at https://openrouter.ai
2. Go to API Keys section
3. Create a new API key
4. Copy to `OPENROUTER_API_KEY`

---

## Starting the Application

### Option 1: Quick Start (Recommended)

```bash
./start.sh
```

This will start both backend and frontend automatically.

### Option 2: Manual Start

**Terminal 1 - Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd frontend
export PATH="$HOME/Library/Python/3.9/bin:$PATH"
streamlit run app.py
```

---

## Accessing the Application

Once started:

- **Frontend Dashboard**: http://localhost:8501
- **Backend API**: http://localhost:3000
- **Health Check**: http://localhost:3000/health

---

## Troubleshooting

### Backend won't start

- Verify all required environment variables in `backend/.env`
- Check Azure PAT has proper permissions
- Ensure OpenRouter API key is valid

### Frontend can't connect

- Verify backend is running on port 3000
- Check `frontend/.env` has correct `BACKEND_API_URL`

### Streamlit command not found

```bash
export PATH="$HOME/Library/Python/3.9/bin:$PATH"
```

---

## Next Steps

1. **Configure credentials** in `backend/.env`
2. **Start the application** using `./start.sh`
3. **Open browser** to http://localhost:8501
4. **Explore features**:
   - View sprint metrics
   - Manage work items
   - Get AI analysis
   - Control MCP server (if enabled)
