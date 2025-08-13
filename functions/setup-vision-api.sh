#!/bin/bash

echo "🚀 Setting up Google Cloud Vision API for FullCircle..."

# Check if we're in the functions directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the functions directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp config.env.example .env
    echo "✅ Created .env file"
    echo "⚠️  Please edit .env file with your actual credentials"
else
    echo "✅ .env file already exists"
fi

# Check if configLoader.js exists
if [ ! -f "configLoader.js" ]; then
    echo "❌ configLoader.js not found. Please ensure all files are present."
    exit 1
fi

# Test the configuration
echo "🧪 Testing configuration..."
node testVisionAPI.js

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Setup completed successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Deploy your functions: firebase deploy --only functions"
    echo "2. Test the selfie verification in your app"
    echo "3. Check Firebase Functions logs for any issues"
else
    echo ""
    echo "❌ Setup failed. Please check the error messages above."
    echo ""
    echo "Common issues:"
    echo "- Missing or invalid Vision API credentials"
    echo "- Vision API not enabled in Google Cloud Console"
    echo "- Service account missing required permissions"
fi
