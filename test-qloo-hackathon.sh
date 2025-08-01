#!/bin/bash

echo "🧪 Testing Qloo Hackathon API Integration"
echo "========================================"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found. Please create it from .env.local.example"
    exit 1
fi

# Check if API key is set
if ! grep -q "QLOO_API_KEY=" .env.local || grep -q "QLOO_API_KEY=your_qloo" .env.local; then
    echo "❌ QLOO_API_KEY not set in .env.local"
    echo "Please add your Qloo Hackathon API key to .env.local"
    exit 1
fi

echo "1. Testing Qloo Hackathon API connection..."
echo ""

# Test the health endpoint
echo "Testing health endpoint..."
curl -s "http://localhost:3000/api/test-qloo" | jq '.' || echo "Health endpoint test failed"

echo ""
echo "2. Testing movie recommendations..."
curl -s -X POST "http://localhost:3000/api/test-qloo" \
  -H "Content-Type: application/json" \
  -d '{"input": "Inception", "category": "movies", "type": "specific"}' | jq '.'

echo ""
echo "3. Testing music recommendations..."
curl -s -X POST "http://localhost:3000/api/test-qloo" \
  -H "Content-Type: application/json" \
  -d '{"input": "Jazz", "category": "music", "type": "genre"}' | jq '.'

echo ""
echo "4. Testing the main recommendations endpoint..."
curl -s -X POST "http://localhost:3000/api/recommendations" \
  -H "Content-Type: application/json" \
  -d '{"input": "Blade Runner", "category": "movies", "type": "specific"}' | jq '.recommendations | length'

echo ""
echo "✅ Qloo Hackathon API testing complete!"
echo ""
echo "If you see errors above, check:"
echo "1. Your QLOO_API_KEY in .env.local"
echo "2. Internet connection"
echo "3. Qloo Hackathon API status"
