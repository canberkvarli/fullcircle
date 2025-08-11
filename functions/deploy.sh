#!/bin/bash

# 🚀 FullCircle Cloud Functions Deployment Script
# This script deploys all cloud functions to Firebase

echo "🪷 Deploying FullCircle Cloud Functions..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the functions directory"
    exit 1
fi

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Error: Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    echo "❌ Error: Not logged in to Firebase. Please login first:"
    echo "firebase login"
    exit 1
fi

echo "📦 Installing dependencies..."
npm install

echo "🔧 Building functions..."
npm run build

echo "🚀 Deploying to Firebase..."
firebase deploy --only functions

echo "✅ Deployment complete!"
echo ""
echo "📋 Deployed functions:"
echo "  • assignWeeklyLotus (scheduled - every Sunday at midnight UTC)"
echo "  • manualAssignWeeklyLotus (callable - for testing)"
echo "  • All existing Stripe functions"
echo ""
echo "📊 Check function status:"
echo "  firebase functions:list"
echo ""
echo "📝 View logs:"
echo "  firebase functions:log --only assignWeeklyLotus"
echo ""
echo "🧪 Test the function manually:"
echo "  Use testWeeklyLotusFunction() in your React Native app"
