#!/bin/bash

echo "🚀 SynesthAI Quick Start"
echo "========================"
echo ""

# Step 1: Install dependencies
echo "Step 1: Installing dependencies..."
chmod +x scripts/install-deps.sh
./scripts/install-deps.sh

# Step 2: Setup Ollama and Gemma
echo ""
echo "Step 2: Setting up Ollama and Gemma 2B..."
chmod +x scripts/fix-setup.sh
./scripts/fix-setup.sh

# Step 3: Environment setup
echo ""
echo "Step 3: Setting up environment..."
if [ ! -f .env.local ]; then
    cp .env.local.example .env.local
    echo "   📝 Created .env.local from template"
    echo "   ⚠️  Please edit .env.local and add your API keys"
else
    echo "   ✅ .env.local already exists"
fi

echo ""
echo "🎉 Quick start complete!"
echo ""
echo "Final steps:"
echo "1. Edit .env.local and add your API keys:"
echo "   - QLOO_API_KEY"
echo "   - TMDB_API_KEY" 
echo "   - SPOTIFY_CLIENT_ID"
echo "   - SPOTIFY_CLIENT_SECRET"
echo ""
echo "2. Start the development server:"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:3000"
