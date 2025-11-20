#!/bin/bash

# Azure DevOps Sprint Manager - Quick Start Script
# This script helps you start both backend and frontend servers

echo "=========================================="
echo "Azure DevOps Sprint Manager - Quick Start"
echo "=========================================="
echo ""

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Backend .env file not found!"
    echo "Please configure backend/.env with your Azure DevOps and OpenRouter credentials"
    exit 1
fi

if [ ! -f "frontend/.env" ]; then
    echo "⚠️  Frontend .env file not found!"
    echo "Please configure frontend/.env with the backend API URL"
    exit 1
fi

echo "✅ Environment files found"
echo ""

# Start backend in background
echo "🚀 Starting backend server..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 5

# Start frontend
echo "🚀 Starting frontend application..."
cd frontend
# Add Python bin to PATH for streamlit
export PATH="$HOME/Library/Python/3.9/bin:$PATH"
streamlit run app.py

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT
