#!/bin/bash

echo "🤖 Checking Ollama Status"
echo "========================="
echo ""

# Check if Ollama is running
if pgrep -x "ollama" > /dev/null; then
    echo "✅ Ollama is running (PID: $(pgrep -x "ollama"))"
    
    # Test API connection
    if curl -s http://localhost:11434/api/tags > /dev/null; then
        echo "✅ Ollama API is accessible"
        
        # Check available models
        echo ""
        echo "📋 Available models:"
        ollama list 2>/dev/null || echo "   Could not list models"
        
        # Test Gemma 2B specifically
        echo ""
        echo "🧪 Testing Gemma 2B..."
        if ollama list 2>/dev/null | grep -q "gemma:2b"; then
            echo "✅ Gemma 2B is available"
            
            # Quick test
            echo "🧪 Quick response test..."
            test_response=$(timeout 10 ollama run gemma:2b "Hello! Respond with just: Working correctly." 2>/dev/null)
            if [[ "$test_response" == *"Working correctly"* ]]; then
                echo "✅ Gemma 2B is responding correctly"
            else
                echo "⚠️ Gemma 2B response test inconclusive"
                echo "   Response: $test_response"
            fi
        else
            echo "❌ Gemma 2B not found"
            echo "   Run: ollama pull gemma:2b"
        fi
        
    else
        echo "❌ Ollama API not accessible"
        echo "   Try restarting: pkill ollama && ollama serve"
    fi
    
else
    echo "❌ Ollama is not running"
    echo "   Start with: ollama serve"
    echo "   Or in background: ollama serve &"
fi

echo ""
echo "🎯 Status Summary:"
echo "=================="

# Overall status
if pgrep -x "ollama" > /dev/null && curl -s http://localhost:11434/api/tags > /dev/null; then
    if ollama list 2>/dev/null | grep -q "gemma:2b"; then
        echo "🎉 Everything is ready! Ollama + Gemma 2B are working."
    else
        echo "⚠️ Ollama is running but Gemma 2B needs to be installed."
        echo "   Run: ollama pull gemma:2b"
    fi
else
    echo "❌ Ollama needs attention. See messages above."
fi

echo ""
echo "💡 Note: If you see 'address already in use' error, it means Ollama is already running (which is good!)"
