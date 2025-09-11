#!/bin/bash

# Render Deployment Script for Insurance Policy Analyzer
echo "🚀 Deploying Insurance Policy Analyzer to Render..."
echo "=================================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env_example.txt .env
    echo "📝 Please edit .env file and add your Google Gemini API key"
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

echo "✅ Environment setup complete!"
echo ""
echo "🌐 Now follow these steps to deploy to Render:"
echo ""
echo "1. 📝 Go to https://render.com"
echo "2. 🔐 Sign up/Login with GitHub"
echo "3. 📁 Connect your GitHub repository"
echo "4. ⚙️  Select 'Web Service'"
echo "5. 🔧 Use these settings:"
echo "   • Build Command: pip install --upgrade pip setuptools wheel && pip install -r requirements-stable.txt"
echo "   • Start Command: python main.py"
echo "   • Environment: Python 3.11"
echo "   • Plan: Free"
echo ""
echo "6. 🔑 Set Environment Variables:"
echo "   • GOOGLE_API_KEY: $(grep GOOGLE_API_KEY .env | cut -d'=' -f2)"
echo "   • CHROMA_PERSIST_DIRECTORY: /opt/render/project/src/chroma_db"
echo "   • UPLOAD_DIRECTORY: /opt/render/project/src/uploads"
echo "   • MAX_FILE_SIZE_MB: 50"
echo "   • ALLOWED_EXTENSIONS: pdf"
echo ""
echo "7. 🚀 Click 'Create Web Service'"
echo ""
echo "8. ⏳ Wait for deployment (5-10 minutes)"
echo ""
echo "9. 🌐 Get your live URL and share with client!"
echo ""
echo "📋 Alternative: Use render.yaml for automatic setup"
echo "   Just push to GitHub and connect the repository!"
echo ""
echo "🎉 Your app will be live at: https://your-app-name.onrender.com"
