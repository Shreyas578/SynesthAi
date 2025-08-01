#!/bin/bash

echo "🎯 Testing Qloo API for Real Data Results"
echo "========================================"
echo ""

# Check if API key is configured
if [ ! -f .env.local ]; then
    echo "❌ .env.local not found"
    exit 1
fi

API_KEY=$(grep "^QLOO_API_KEY=" .env.local | cut -d'=' -f2-)

if [ -z "$API_KEY" ] || [[ "$API_KEY" == *"your_qloo"* ]]; then
    echo "❌ QLOO_API_KEY not configured"
    exit 1
fi

echo "🔑 Testing API patterns that should return real data..."
echo ""

# Test patterns that are more likely to return results
test_cases=(
    "filter.type=urn:entity:movie&signal.context.popularity=trending&limit=5"
    "filter.type=urn:entity:movie&signal.context.time=recent&limit=5"
    "filter.type=urn:entity:place&signal.context.popularity=trending&limit=5"
    "filter.type=urn:entity:restaurant&signal.context.popularity=trending&limit=5"
    "filter.type=urn:entity:music&signal.context.popularity=trending&limit=5"
    "filter.type=urn:entity:book&signal.context.popularity=trending&limit=5"
    "filter.type=urn:entity:game&signal.context.popularity=trending&limit=5"
)

successful_patterns=()

for test_case in "${test_cases[@]}"; do
    echo "Testing: $test_case"
    
    response=$(curl -s -w "HTTP_STATUS:%{http_code}" \
      -H "X-Api-Key: $API_KEY" \
      -H "Content-Type: application/json" \
      "https://hackathon.api.qloo.com/v2/insights/?$test_case")
    
    http_status=$(echo "$response" | grep -o "HTTP_STATUS:[0-9]*" | cut -d: -f2)
    response_body=$(echo "$response" | sed 's/HTTP_STATUS:[0-9]*$//')
    
    if [ "$http_status" = "200" ]; then
        # Check if we actually got results
        result_count=$(echo "$response_body" | jq '.results.entities | length' 2>/dev/null || echo "0")
        
        if [ "$result_count" -gt "0" ]; then
            echo "✅ SUCCESS - Found $result_count results!"
            successful_patterns+=("$test_case")
            
            # Show first result
            first_name=$(echo "$response_body" | jq -r '.results.entities[0].name // "N/A"' 2>/dev/null)
            echo "   First result: $first_name"
            
        else
            echo "⚠️ Connected but no results returned"
        fi
    else
        echo "❌ Failed with status: $http_status"
        if [ "$http_status" = "403" ]; then
            echo "   This entity type is forbidden for your API key"
        fi
    fi
    echo ""
done

echo "📊 Summary:"
echo "==========="

if [ ${#successful_patterns[@]} -gt 0 ]; then
    echo "🎉 Found ${#successful_patterns[@]} working patterns that return real data!"
    echo ""
    echo "✅ Working patterns:"
    for pattern in "${successful_patterns[@]}"; do
        entity_type=$(echo "$pattern" | grep -o 'urn:entity:[^&]*' | cut -d: -f3)
        echo "   - $entity_type: $pattern"
    done
    
    echo ""
    echo "🚀 SynesthAI will now use these patterns to get real Qloo data!"
    echo "   Categories with working patterns will show real recommendations."
    echo "   Other categories will use AI-enhanced mock data."
    
else
    echo "❌ No patterns returned real data."
    echo "   This could mean:"
    echo "   1. Your API key has limited access"
    echo "   2. The Qloo database is empty for these queries"
    echo "   3. Different query parameters are needed"
    echo ""
    echo "   SynesthAI will use high-quality mock data with Gemma 2B AI."
fi

echo ""
echo "💡 Next steps:"
echo "1. Run: npm run dev"
echo "2. Test categories that showed ✅ SUCCESS above"
echo "3. Try specific searches like 'Inception' or 'Tokyo'"
