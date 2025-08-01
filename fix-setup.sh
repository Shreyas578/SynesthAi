#!/bin/bash

echo "🔧 SynesthAI Setup Fix"
echo "======================"
echo ""

# Check if Ollama is already running
echo "1. Checking Ollama status..."
if pgrep -x "ollama" > /dev/null; then
    echo "   ✅ Ollama is already running"
else
    echo "   ⚠️  Ollama is not running, starting..."
    ollama serve &
    sleep 3
fi

# Check if Gemma 2B is available
echo ""
echo "2. Checking Gemma 2B model..."
if ollama list | grep -q "gemma:2b"; then
    echo "   ✅ Gemma 2B model is installed"
else
    echo "   📥 Installing Gemma 2B model..."
    ollama pull gemma:2b
fi

# Test the connection
echo ""
echo "3. Testing Ollama connection..."
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "   ✅ Ollama API is accessible"
else
    echo "   ❌ Ollama API is not accessible"
    echo "   Try: pkill ollama && ollama serve"
    exit 1
fi

# Test Gemma 2B specifically
echo ""
echo "4. Testing Gemma 2B model..."
test_response=$(curl -s -X POST http://localhost:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gemma:2b",
    "prompt": "Hello! Respond with: I am working correctly.",
    "stream": false,
    "options": {
      "temperature": 0.6,
      "max_tokens": 20
    }
  }')

if echo "$test_response" | grep -q "working correctly"; then
    echo "   ✅ Gemma 2B is responding correctly"
else
    echo "   ⚠️  Gemma 2B response test inconclusive"
    echo "   Response: $(echo "$test_response" | jq -r '.response' 2>/dev/null || echo "$test_response")"
fi

echo ""
echo "🎉 Setup verification complete!"
echo ""
echo "Next steps:"
echo "1. Run: npm install --legacy-peer-deps"
echo "2. Copy .env.local.example to .env.local"
echo "3. Add your API keys to .env.local"
echo "4. Run: npm run dev"
