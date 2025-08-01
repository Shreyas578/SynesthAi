#!/bin/bash

echo "📦 Installing SynesthAI Dependencies"
echo "===================================="
echo ""

echo "Cleaning previous installations..."
rm -rf node_modules package-lock.json

echo ""
echo "Installing with legacy peer deps to resolve conflicts..."
npm install --legacy-peer-deps

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Run: npm run setup-gemma"
echo "2. Configure .env.local with your API keys"
echo "3. Run: npm run dev"
