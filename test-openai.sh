#!/bin/bash

echo "🧪 Testing OpenAI Integration"
echo "============================="

# Check if OpenAI key is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ OPENAI_API_KEY not set in environment"
    echo "💡 Add your key to .env file:"
    echo "   OPENAI_API_KEY=sk-your-actual-key"
    exit 1
else
    echo "✅ OPENAI_API_KEY found (${OPENAI_API_KEY:0:10}...)"
fi

echo ""
echo "🤖 Testing OpenAI API connection..."

# Test OpenAI API directly
python3 -c "
import os
import openai

try:
    client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
    response = client.chat.completions.create(
        model='gpt-3.5-turbo',
        messages=[{'role': 'user', 'content': 'Hello, respond with: OpenAI is working!'}],
        max_tokens=20
    )
    print('✅ OpenAI API is working!')
    print('📝 Response:', response.choices[0].message.content)
except ImportError:
    print('❌ OpenAI library not installed')
    print('💡 Install with: pip install openai')
except Exception as e:
    print('❌ OpenAI API error:', str(e))
    print('💡 Check your API key at: https://platform.openai.com/account/api-keys')
"

echo ""
echo "🔍 Testing Python AI service..."

# Check if Python service is running
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Python AI service is running on port 8000"
    
    # Test the onboarding analyze endpoint
    echo "🧪 Testing persona analysis endpoint..."
    curl -X POST http://localhost:8000/onboarding/analyze \
      -H "Content-Type: application/json" \
      -d '{"url": "https://example.com", "use_ai": true}' \
      -w "\n📊 HTTP Status: %{http_code}\n" \
      --max-time 30
      
else
    echo "❌ Python AI service not running on port 8000"
    echo "💡 Start with: ./quick-test.sh"
fi

echo ""
echo "🎯 How to verify OpenAI is working:"
echo "1. Run: ./quick-test.sh"
echo "2. Check browser console for: '✅ REAL OPENAI ANALYSIS COMPLETED'"
echo "3. Look for '🤖 OpenAI Generated' badge in the UI"
echo "4. Check OpenAI usage at: https://platform.openai.com/usage"
