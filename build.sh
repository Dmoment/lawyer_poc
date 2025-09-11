#!/bin/bash

# Build script for Render deployment
echo "🔧 Building Insurance Policy Analyzer for Render..."

# Upgrade pip first
pip install --upgrade pip

# Install setuptools and wheel first
pip install --upgrade setuptools wheel

# Install core dependencies first
pip install fastapi uvicorn python-multipart pydantic python-dotenv aiofiles jinja2

# Install ML dependencies
pip install numpy pandas

# Install ChromaDB
pip install chromadb

# Install Google AI
pip install google-generativeai

# Install PDF processing
pip install pypdf2 pdfplumber

# Install sentence transformers (this might take a while)
pip install sentence-transformers

# Install tiktoken
pip install tiktoken

echo "✅ Build complete!"
