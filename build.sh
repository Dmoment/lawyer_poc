#!/bin/bash

echo "🐳 Building Insurance Policy Analyzer with Docker..."

# Build the Docker image
docker build -t insurance-analyzer .

if [ $? -eq 0 ]; then
    echo "✅ Docker build successful!"
    echo ""
    echo "🚀 To run the application:"
    echo "   docker-compose up"
    echo ""
    echo "🌐 Access the application at: http://localhost:8000"
else
    echo "❌ Docker build failed!"
    exit 1
fi