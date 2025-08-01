#!/bin/bash

echo "🔍 Checking Environment Configuration"
echo "===================================="
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found"
    echo "📝 Creating .env.local from template..."
    cp .env.local.example .env.local
    echo "✅ Created .env.local - please add your API keys"
    echo ""
fi

echo "📋 Current environment configuration:"
echo ""

# Check each required environment variable
check_env_var() {
    local var_name=$1
    local var_value=$(grep "^$var_name=" .env.local 2>/dev/null | cut -d'=' -f2-)
    
    if [ -z "$var_value" ] || [[ "$var_value" == *"your_"* ]]; then
        echo "❌ $var_name: Not configured"
        return 1
    else
        # Show first 10 characters for security
        local masked_value="${var_value:0:10}..."
        echo "✅ $var_name: $masked_value"
        return 0
    fi
}

# Check all required variables
required_vars=("QLOO_API_KEY" "OLLAMA_BASE_URL" "OLLAMA_MODEL")
optional_vars=("TMDB_API_KEY" "SPOTIFY_CLIENT_ID" "SPOTIFY_CLIENT_SECRET")

echo "Required variables:"
all_required_set=true
for var in "${required_vars[@]}"; do
    if ! check_env_var "$var"; then
        all_required_set=false
    fi
done

echo ""
echo "Optional variables (for media enrichment):"
for var in "${optional_vars[@]}"; do
    check_env_var "$var"
done

echo ""
if [ "$all_required_set" = true ]; then
    echo "🎉 All required environment variables are configured!"
else
    echo "⚠️  Some required environment variables need to be configured in .env.local"
    echo ""
    echo "Required API keys:"
    echo "1. QLOO_API_KEY - Get from Qloo Hackathon dashboard"
    echo "2. OLLAMA_BASE_URL - Should be http://localhost:11434"
    echo "3. OLLAMA_MODEL - Should be gemma:2b"
    echo ""
    echo "Optional API keys (for better media content):"
    echo "4. TMDB_API_KEY - Get from https://www.themoviedb.org/settings/api"
    echo "5. SPOTIFY_CLIENT_ID & SPOTIFY_CLIENT_SECRET - Get from https://developer.spotify.com/dashboard"
fi

echo ""
echo "🧪 Testing API connections..."

# Test Ollama
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Ollama: Connected"
else
    echo "❌ Ollama: Not running (run: ollama serve)"
fi

# Test if Gemma 2B is available
if ollama list 2>/dev/null | grep -q "gemma:2b"; then
    echo "✅ Gemma 2B: Available"
else
    echo "❌ Gemma 2B: Not installed (run: ollama pull gemma:2b)"
fi
