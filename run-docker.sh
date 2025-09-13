#!/bin/bash

echo "🚀 Starting Insurance Policy Analyzer with Docker..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env.example .env
    echo "📝 Please edit .env file with your Google API key"
    echo "   Get your API key from: https://makersuite.google.com/app/apikey"
    exit 1
fi

# Build and run with Docker Compose
echo "🐳 Building and starting containers..."
docker-compose up --build

echo "✅ Application stopped"
