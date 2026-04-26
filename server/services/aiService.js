const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-dummy-key-for-testing-only'
});

const ANALYSIS_PROMPT = `You are a professional trading analyst with 20 years of experience. 
Analyze the provided chart image and return a JSON object with your trading decision.

Instructions:
1. Analyze ONLY what is visible in the image
2. Identify the trend direction (uptrend/downtrend/consolidation)
3. Find support and resistance zones
4. Look for patterns (breakouts, fakeouts, reversals)
5. Note any visible indicators (RSI, MACD, Moving Averages)
6. Evaluate market structure, momentum, and volatility
7. Extract actual price levels visible on the chart

Return ONLY a JSON object (no other text):
{
  "signal": "Buy" or "Sell" or "Hold",
  "confidence": 0-100 (based on clarity and quality of setup),
  "entryPrice": actual price from chart or null,
  "stopLoss": actual price from chart or null,
  "takeProfit": [price1, price2] or [],
  "riskLevel": "Low" or "Medium" or "High",
  "explanation": "2-3 sentences explaining your analysis"
}

If the chart is unclear or insufficient:
- Set signal to "Hold"
- Set confidence to 30 or lower
- Explain why in the explanation

IMPORTANT: Generate unique analysis for each image. Never reuse previous responses.`;

exports.analyzeChart = async (imageBase64, imageMimeType) => {
  try {
    // Check if we are using a dummy key, and return mock data if so.
    if (process.env.OPENAI_API_KEY === 'sk-dummy-key-for-testing-only' || !process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'sk-test-1234567890abcdef') {
      const signals = ['Buy', 'Sell', 'Hold'];
      const risks = ['Low', 'Medium', 'High'];
      return {
        success: true,
        result: {
          signal: signals[Math.floor(Math.random() * signals.length)],
          confidence: Math.floor(Math.random() * 40) + 60, // 60-99
          entryPrice: 50000 + Math.floor(Math.random() * 10000),
          stopLoss: 48000 + Math.floor(Math.random() * 2000),
          takeProfit: [55000, 60000],
          riskLevel: risks[Math.floor(Math.random() * risks.length)],
          explanation: 'This is a mocked analysis because a test OpenAI API key was detected. The chart shows a strong support level being tested with bullish divergence on the RSI.'
        }
      };
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: ANALYSIS_PROMPT },
            {
              type: 'image_url',
              image_url: {
                url: `data:${imageMimeType};base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0]);
      return {
        success: true,
        result: {
          signal: result.signal || 'Hold',
          confidence: result.confidence || 50,
          entryPrice: result.entryPrice || null,
          stopLoss: result.stopLoss || null,
          takeProfit: result.takeProfit || [],
          riskLevel: result.riskLevel || 'Medium',
          explanation: result.explanation || 'Analysis completed.'
        }
      };
    } else {
      return {
        success: false,
        result: {
          signal: 'Hold',
          confidence: 30,
          entryPrice: null,
          stopLoss: null,
          takeProfit: [],
          riskLevel: 'High',
          explanation: 'Unable to analyze the chart. Please try a clearer image.'
        }
      };
    }
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return {
      success: false,
      result: {
        signal: 'Hold',
        confidence: 30,
        entryPrice: null,
        stopLoss: null,
        takeProfit: [],
        riskLevel: 'High',
        explanation: 'AI analysis failed. Please try again.'
      }
    };
  }
};
