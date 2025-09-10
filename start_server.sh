#!/bin/bash

echo "🚀 Starting Insurance Policy Document Analyzer Backend Server"
echo "=============================================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please create it from env_example.txt"
    exit 1
fi

# Create necessary directories
mkdir -p uploads chroma_db

echo "📁 Created necessary directories"

# Start the server with logging
echo "🔧 Starting FastAPI server on http://localhost:8000"
echo "📊 API Documentation available at http://localhost:8000/docs"
echo ""
echo "📝 To view logs in real-time, run this in another terminal:"
echo "   tail -f server.log"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Start server and log to file
python main.py 2>&1 | tee server.log
