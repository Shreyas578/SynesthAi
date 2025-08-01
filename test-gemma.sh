#!/bin/bash

echo "🧪 Testing Gemma 2B Integration"
echo "==============================="
echo ""

# Check if Ollama is running
echo "1. Checking Ollama service..."
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "   ✅ Ollama is running"
else
    echo "   ❌ Ollama is not running. Please start with: ollama serve"
    exit 1
fi

# Check if Gemma 2B is available
echo ""
echo "2. Checking Gemma 2B model..."
if ollama list | grep -q "gemma:2b"; then
    echo "   ✅ Gemma 2B model is installed"
else
    echo "   ❌ Gemma 2B model not found. Installing..."
    ollama pull gemma:2b
fi

# Test model response
echo ""
echo "3. Testing model response..."
response=$(curl -s -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemma:2b",
    "prompt": "You are a helpful assistant. Respond with: Hello, I am working correctly!",
    "stream": false,
    "options": {
      "temperature": 0.6,
      "max_tokens": 50
    }
  }')

if echo "$response" | grep -q "response"; then
    echo "   ✅ Model is responding correctly"
    echo "   Response preview: $(echo "$response" | jq -r '.response' | head -c 100)..."
else
    echo "   ❌ Model test failed"
    echo "   Response: $response"
fi

echo ""
echo "4. Testing SynesthAI recommendation format..."
test_response=$(curl -s -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemma:2b",
    "prompt": "You are SynesthAI. User likes \"Inception\" in movies. For the recommendation \"Tenet\", respond in JSON: {\"Tenet\": {\"reason\": \"brief reason\", \"tips\": \"one tip\", \"personalizedInsight\": \"insight\"}}",
    "stream": false,
    "options": {
      "temperature": 0.6,
      "max_tokens": 200
    }
  }')

if echo "$test_response" | jq -r '.response' | grep -q "reason"; then
    echo "   ✅ Recommendation format test passed"
else
    echo "   ⚠️  Recommendation format may need adjustment"
fi

echo ""
echo "🎉 Gemma 2B setup verification complete!"
echo ""
echo "Next steps:"
echo "1. Copy .env.local.example to .env.local"
echo "2. Add your API keys to .env.local"
echo "3. Run: npm run dev"
echo "4. Test the application at http://localhost:3000"
