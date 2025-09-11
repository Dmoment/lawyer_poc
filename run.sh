#!/bin/bash

# Insurance Policy Document Analyzer - Startup Script (Powered by Google Gemini)

echo "🚀 Starting Insurance Policy Document Analyzer with Google Gemini..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env_example.txt .env
    echo "📝 Please edit .env file and add your Google Gemini API key"
    echo "   Get your API key from: https://makersuite.google.com/app/apikey"
    echo "   Then run this script again."
    exit 1
fi

# Check if Google API key is set
if ! grep -q "GOOGLE_API_KEY=AIza" .env; then
    echo "⚠️  Google Gemini API key not found in .env file"
    echo "   Please add your Google Gemini API key to .env file"
    echo "   Get your API key from: https://makersuite.google.com/app/apikey"
    exit 1
fi

# Create necessary directories
mkdir -p uploads chroma_db

# Install Python dependencies
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

# Start backend in background
echo "🔧 Starting backend server..."
python main.py &
BACKEND_PID=$!

# Wait for backend to start
echo "⏳ Waiting for backend to start..."
sleep 5

# Start frontend
echo "🎨 Starting frontend..."
cd frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Application started successfully with Google Gemini!"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo "   🤖 Powered by Google Gemini 1.5 Flash"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Wait for processes
wait
