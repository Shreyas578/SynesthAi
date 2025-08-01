#!/bin/bash

echo "🔍 Debugging Qloo API Integration"
echo "================================="
echo ""

# Check environment
echo "1. Environment check:"
if [ -f .env.local ]; then
    echo "✅ .env.local exists"
    
    if grep -q "QLOO_API_KEY=" .env.local; then
        API_KEY=$(grep "^QLOO_API_KEY=" .env.local | cut -d'=' -f2-)
        if [[ "$API_KEY" != *"your_qloo"* ]] && [ -n "$API_KEY" ]; then
            echo "✅ QLOO_API_KEY is configured"
            echo "   Key preview: ${API_KEY:0:15}..."
        else
            echo "❌ QLOO_API_KEY not properly configured"
            exit 1
        fi
    else
        echo "❌ QLOO_API_KEY not found in .env.local"
        exit 1
    fi
else
    echo "❌ .env.local not found"
    exit 1
fi

echo ""

# Test different API endpoints
echo "2. Testing different Qloo API endpoints:"
echo ""

endpoints=(
    "v2/insights/?filter.type=urn:entity:movie&limit=1"
    "v1/recommendations"
    "v2/entities"
    "health"
)

for endpoint in "${endpoints[@]}"; do
    echo "Testing: https://hackathon.api.qloo.com/$endpoint"
    
    if [[ "$endpoint" == *"v1/recommendations"* ]]; then
        # POST request for v1 recommendations
        response=$(curl -s -w "HTTP_STATUS:%{http_code}" \
          -X POST \
          -H "X-Api-Key: $API_KEY" \
          -H "Content-Type: application/json" \
          -d '{"input":{"type":"movie","name":"Inception"},"output":{"types":["movies"],"count":1}}' \
          "https://hackathon.api.qloo.com/$endpoint")
    else
        # GET request for other endpoints
        response=$(curl -s -w "HTTP_STATUS:%{http_code}" \
          -H "X-Api-Key: $API_KEY" \
          -H "Content-Type: application/json" \
          "https://hackathon.api.qloo.com/$endpoint")
    fi
    
    http_status=$(echo "$response" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    response_body=$(echo "$response" | sed 's/HTTP_STATUS:[0-9]*$//')
    
    if [ "$http_status" = "200" ]; then
        echo "✅ Status: $http_status - Success"
        echo "   Response: $(echo "$response_body" | head -c 100)..."
    else
        echo "❌ Status: $http_status - Failed"
        echo "   Error: $(echo "$response_body" | head -c 200)..."
    fi
    echo ""
done

echo "3. Testing authentication methods:"
echo ""

# Test different auth methods
auth_methods=(
    "X-Api-Key"
    "Authorization: Bearer"
    "Authorization: API-Key"
)

for auth_method in "${auth_methods[@]}"; do
    echo "Testing auth method: $auth_method"
    
    if [[ "$auth_method" == "X-Api-Key" ]]; then
        header="X-Api-Key: $API_KEY"
    elif [[ "$auth_method" == "Authorization: Bearer" ]]; then
        header="Authorization: Bearer $API_KEY"
    else
        header="Authorization: API-Key $API_KEY"
    fi
    
    response=$(curl -s -w "HTTP_STATUS:%{http_code}" \
      -H "$header" \
      -H "Content-Type: application/json" \
      "https://hackathon.api.qloo.com/v2/insights/?filter.type=urn:entity:movie&limit=1")
    
    http_status=$(echo "$response" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    
    if [ "$http_status" = "200" ]; then
        echo "✅ $auth_method works!"
    else
        echo "❌ $auth_method failed (status: $http_status)"
    fi
done

echo ""
echo "🎯 Recommendations:"
echo "1. Use X-Api-Key header for authentication"
echo "2. Use v2/insights endpoint for data retrieval"
echo "3. Check Qloo documentation for exact API format"
echo "4. Verify your API key has proper permissions"
