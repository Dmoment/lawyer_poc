#!/bin/bash

# Optimized Railway Deployment Script for Insurance Policy Analyzer
echo "🚀 Deploying Insurance Policy Analyzer to Railway (Optimized)..."
echo "================================================================"

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

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Railway CLI. Please install manually:"
        echo "   npm install -g @railway/cli"
        exit 1
    fi
fi

# Login to Railway
echo "🔐 Logging into Railway..."
railway login
if [ $? -ne 0 ]; then
    echo "❌ Failed to login to Railway. Please try again."
    exit 1
fi

# Create new project
echo "🏗️  Creating Railway project..."
railway init
if [ $? -ne 0 ]; then
    echo "❌ Failed to create Railway project. Please try again."
    exit 1
fi

# Set environment variables
echo "🔧 Setting environment variables..."
GOOGLE_API_KEY=$(grep GOOGLE_API_KEY .env | cut -d'=' -f2)
railway variables set GOOGLE_API_KEY="$GOOGLE_API_KEY"
railway variables set CHROMA_PERSIST_DIRECTORY="/app/chroma_db"
railway variables set UPLOAD_DIRECTORY="/app/uploads"
railway variables set MAX_FILE_SIZE_MB="50"
railway variables set ALLOWED_EXTENSIONS="pdf"

# Set Railway to use Dockerfile
echo "🐳 Configuring Railway to use Dockerfile..."
railway variables set RAILWAY_BUILDER="DOCKERFILE"

# Deploy with timeout handling
echo "🚀 Deploying to Railway (this may take 5-10 minutes)..."
echo "   The build includes heavy ML libraries, so please be patient..."
railway up
if [ $? -ne 0 ]; then
    echo "❌ Deployment failed. This might be due to:"
    echo "   1. Build timeout (try again)"
    echo "   2. Memory limits (upgrade Railway plan)"
    echo "   3. Network issues (check your connection)"
    echo ""
    echo "🔍 Check logs with: railway logs"
    exit 1
fi

# Get the URL
echo "🌐 Getting your app URL..."
APP_URL=$(railway domain)
if [ -z "$APP_URL" ]; then
    echo "⚠️  Could not get app URL. Check Railway dashboard."
    APP_URL="https://your-app-name.railway.app"
fi

echo ""
echo "✅ Deployment complete!"
echo "================================================================"
echo "🌐 Your app is live at: $APP_URL"
echo "📧 Share this URL with your client!"
echo ""
echo "🎯 Demo instructions for your client:"
echo "1. Open $APP_URL in browser"
echo "2. Upload an insurance policy PDF"
echo "3. Ask questions like:"
echo "   - 'Does the policy cover physiotherapy?'"
echo "   - 'What are the coverage limits?'"
echo "   - 'What are the exclusions?'"
echo "4. Get AI-powered answers with citations!"
echo ""
echo "🔍 Check your app status:"
echo "   railway status"
echo "   railway logs"
echo ""
echo "💡 If build fails due to timeout:"
echo "   1. Try again (sometimes it works on retry)"
echo "   2. Upgrade to Railway Pro plan for more resources"
echo "   3. Check Railway dashboard for detailed logs"
echo ""
echo "🎉 Ready to demo to your client!"
