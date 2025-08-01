#!/bin/bash

echo "🚀 SynesthAI Gemma 2B Setup Guide"
echo "================================="
echo ""

echo "1. Install Ollama (if not already installed):"
echo "   macOS: brew install ollama"
echo "   Linux: curl -fsSL https://ollama.ai/install.sh | sh"
echo "   Windows: Download from https://ollama.ai/download"
echo ""

echo "2. Pull the Gemma 2B model:"
echo "   ollama pull gemma:2b"
echo ""

echo "3. Verify the model is installed:"
echo "   ollama list"
echo ""

echo "4. Start Ollama server:"
echo "   ollama serve"
echo ""

echo "5. Test Gemma 2B model:"
echo "   ollama run gemma:2b \"Hello, how are you?\""
echo ""

echo "6. Test API endpoint:"
echo "   curl -X POST http://localhost:11434/api/generate \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"model\": \"gemma:2b\", \"prompt\": \"Hello\", \"stream\": false}'"
echo ""

echo "✨ Gemma 2B is optimized for:"
echo "   - Fast inference on consumer hardware"
echo "   - Lower memory usage (~3GB RAM)"
echo "   - Good performance for text generation tasks"
echo ""

echo "🔧 Recommended system requirements:"
echo "   - RAM: 4GB+ available"
echo "   - Storage: 2GB for model"
echo "   - CPU: Modern multi-core processor"
