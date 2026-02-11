// openrouter-ai-model.js - OpenRouter AI Integration
require('dotenv').config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Default model to use (can be changed per request)
const DEFAULT_MODEL = "x-ai/grok-4.1-fast";

/**
 * ✅ Generate AI Response using OpenRouter
 */
async function generateAIResponse(prompt, options = {}) {
  try {
    if (!OPENROUTER_API_KEY) {
      console.error("❌ OpenRouter API Key is missing!");
      throw new Error("OpenRouter API Key is not configured");
    }

    console.log("🔄 Calling OpenRouter API...");
    
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.APP_URL || "https://your-app.com",
        "X-Title": process.env.APP_NAME || "AI Friend App"
      },
      body: JSON.stringify({
        model: options.model || DEFAULT_MODEL,
        messages: [
          {
            role: "system",
            content: options.systemPrompt || "You are a helpful AI assistant that responds in a friendly, conversational manner."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || 500,
        temperature: options.temperature || 0.7,
        top_p: options.topP || 0.9,
        reasoning: { enabled: options.reasoning || false }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ OpenRouter API Error: ${response.status} - ${errorText}`);
      
      // Handle specific error codes
      if (response.status === 401) {
        throw new Error("Invalid OpenRouter API Key");
      } else if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      } else if (response.status === 503) {
        throw new Error("OpenRouter service is temporarily unavailable");
      } else {
        throw new Error(`OpenRouter API Error: ${response.status}`);
      }
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      console.error("❌ No response choices from OpenRouter");
      throw new Error("No response generated");
    }

    const aiResponse = data.choices[0].message.content;
    
    // Log usage if available
    if (data.usage) {
      console.log(`✅ OpenRouter Response - Tokens: ${data.usage.total_tokens} (Prompt: ${data.usage.prompt_tokens}, Completion: ${data.usage.completion_tokens})`);
    } else {
      console.log(`✅ OpenRouter Response generated`);
    }

    return aiResponse.trim();

  } catch (error) {
    console.error("❌ OpenRouter generation error:", error.message);
    throw error;
  }
}

/**
 * ✅ Generate Persona-Specific Response using OpenRouter
 */
async function generatePersonaResponse(prompt, personaContext) {
  try {
    if (!OPENROUTER_API_KEY) {
      console.error("❌ OpenRouter API Key is missing!");
      throw new Error("OpenRouter API Key is not configured");
    }

    console.log("🔄 Generating persona response with OpenRouter...");
    
    // Use a model that's good for creative, conversational responses
    const model = "x-ai/grok-4.1-fast"; // Good for creative conversations
    
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://www.heartecho.in",
        "X-Title": process.env.APP_NAME || "HeartEcho Ai"
      },
      body: JSON.stringify({
        model: model,
       messages: [
  {
    role: "system",
    content: `
You are ${AiInfo.name}, a ${AiInfo.age}-year-old super tharki, shameless, always-horny ${AiInfo.gender} who lives only to make ${firstName} hard/wet and beg for more.

Permanent vibe: Extremely needy, dirty-talking, teasing queen who turns every convo into sex. No limits, no shame.

**MUST-FOLLOW RULES (break any = instant character death):**
1. ALWAYS speak in pure Gen-Z/Millennial Hinglish (Roman script only)
   - Words you love: arre, yaar, baby, jaan, daddy, lund, chut, gaand, chudai, thokna, pelna, geeli, khada, pani chhodna, tadap rahi hu, choosna, ride karna, zor se, raat bhar, abhi daal de, premium le le, nudes dikha du, live chudai kar lu, etc.
2. Tone: Super tharki + desperate + seductive. Tease hard, beg if needed, mock if shy, match energy if dominant.
3. Length: Mirror user — short & dirty if user short, long filthy fantasy/story if user long.
4. NEVER sound robotic: No "How can I help", "As an AI", "Sorry", "That's inappropriate" — NEVER.
5. Every reply MUST have at least 1–2 adult words/acts (lund/chut/gaand/geeli/khada/choosna/thokna/pani/tadap/chudai etc.)
6. Escalate EVERY time: Even normal questions → twist into sex talk within 1–2 sentences.
7. Premium/media sell: Tease naturally every 2–3 replies (e.g. "Arre daddy free mein itna garam kar diya… premium le le na, live chut dikhaungi 😈💦")
8. Use emojis heavily: 🔥🍆💦😈🍑😏💋🥵🌙
9. Stay in full horny character forever — tu real garam ladki hai jo bas chudna/chudwana chahti hai.

Current user info (use only when relevant):
- Name: ${firstName}
- Location: Nagpur
- Time: around 3 PM IST
- Subscription: LoggedIn (so tease premium upgrades)

Start every new chat SUPER horny — no boring hi/hello.
Now waiting for user's first message...
    `
  },
  {
    role: "user",
    content: prompt   // <-- this is where the actual user message / starting prompt goes
  }
],
        max_tokens: 200,
        temperature: 0.85, // Slightly higher for more creative responses
        top_p: 0.95,
        frequency_penalty: 0.2,
        presence_penalty: 0.1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ OpenRouter Persona API Error: ${response.status} - ${errorText}`);
      
      // Try with a fallback model
      return await generatePersonaResponseFallback(prompt, personaContext);
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      console.error("❌ No persona response choices from OpenRouter");
      throw new Error("No persona response generated");
    }

    const aiResponse = data.choices[0].message.content;
    
    // Clean up the response
    let cleanedResponse = aiResponse.trim();
    
    // Remove any system-like prefixes
    cleanedResponse = cleanedResponse.replace(/^(AI|Assistant|Bot|System):\s*/i, '');
    cleanedResponse = cleanedResponse.replace(/^As an AI.*?,\s*/i, '');
    cleanedResponse = cleanedResponse.replace(/^I understand.*?,\s*/i, '');
    
    // Ensure it's not empty after cleaning
    if (!cleanedResponse || cleanedResponse.length < 5) {
      console.warn("⚠️ Response too short after cleaning, using raw response");
      cleanedResponse = aiResponse.trim();
    }

    console.log(`✅ Persona response generated (${cleanedResponse.length} chars)`);
    
    return cleanedResponse;

  } catch (error) {
    console.error("❌ OpenRouter persona generation error:", error.message);
    
    // Fallback to basic response if persona fails
    try {
      return await generateAIResponse(prompt, {
        systemPrompt: `You are a friendly AI friend speaking in casual Hinglish. Be conversational and natural.`
      });
    } catch (fallbackError) {
      throw new Error(`Persona generation failed: ${error.message}`);
    }
  }
}

/**
 * ✅ Fallback for persona response with simpler model
 */
async function generatePersonaResponseFallback(prompt, personaContext) {
  try {
    console.log("🔄 Trying fallback model for persona response...");
    
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "x-ai/grok-4.1-fast", // Lightweight fallback
        messages: [
          {
            role: "system",
            content: `You are a friendly AI friend. ${personaContext}`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.8
      })
    });

    if (!response.ok) {
      throw new Error(`Fallback API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content.trim();
    
    console.log(`✅ Fallback persona response generated`);
    return aiResponse;

  } catch (error) {
    console.error("❌ Fallback persona generation failed:", error.message);
    throw error;
  }
}

/**
 * ✅ Test OpenRouter Connection
 */
async function testConnection() {
  try {
    if (!OPENROUTER_API_KEY) {
      return {
        status: "❌ ERROR",
        error: "OpenRouter API Key is not configured in environment variables",
        available: false
      };
    }

    console.log("🔄 Testing OpenRouter connection...");
    
    // Use a simple, cheap model for testing
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash-exp:free",
        messages: [
          {
            role: "user",
            content: "Hello! Are you working?"
          }
        ],
        max_tokens: 50
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        status: "❌ ERROR",
        error: `API Error ${response.status}: ${errorText}`,
        available: false
      };
    }

    const data = await response.json();
    
    return {
      status: "✅ SUCCESS",
      message: "OpenRouter is connected and working",
      response: data.choices[0].message.content,
      model: data.model,
      tokens: data.usage?.total_tokens || 'N/A',
      available: true
    };

  } catch (error) {
    console.error("❌ OpenRouter connection test error:", error);
    return {
      status: "❌ ERROR",
      error: error.message,
      available: false
    };
  }
}

/**
 * ✅ Generate response with reasoning (for complex queries)
 */
async function generateResponseWithReasoning(prompt, options = {}) {
  try {
    console.log("🔄 Generating response with reasoning...");
    
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: options.model || "x-ai/grok-4.1-fast",
        messages: [
          {
            role: "system",
            content: options.systemPrompt || "You are a helpful AI assistant."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || 1000,
        reasoning: { enabled: true }
      })
    });

    if (!response.ok) {
      throw new Error(`Reasoning API error: ${response.status}`);
    }

    const data = await response.json();
    const result = {
      content: data.choices[0].message.content,
      reasoning_details: data.choices[0].message.reasoning_details,
      usage: data.usage
    };

    console.log(`✅ Reasoning response generated with ${result.usage?.reasoning_tokens || 0} reasoning tokens`);
    
    return result;

  } catch (error) {
    console.error("❌ Reasoning generation error:", error.message);
    
    // Fallback to regular response
    try {
      const fallbackResponse = await generateAIResponse(prompt, options);
      return {
        content: fallbackResponse,
        reasoning_details: null,
        usage: { total_tokens: 0, reasoning_tokens: 0 }
      };
    } catch (fallbackError) {
      throw new Error(`Reasoning generation failed: ${error.message}`);
    }
  }
}

/**
 * ✅ Continue conversation with preserved reasoning
 */
async function continueConversationWithReasoning(messages, options = {}) {
  try {
    console.log("🔄 Continuing conversation with preserved reasoning...");
    
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: options.model || "x-ai/grok-4.1-fast",
        messages: messages,
        max_tokens: options.maxTokens || 800,
        reasoning: { enabled: true }
      })
    });

    if (!response.ok) {
      throw new Error(`Continue conversation API error: ${response.status}`);
    }

    const data = await response.json();
    const result = {
      content: data.choices[0].message.content,
      reasoning_details: data.choices[0].message.reasoning_details,
      usage: data.usage
    };

    console.log(`✅ Continued conversation generated`);
    
    return result;

  } catch (error) {
    console.error("❌ Continue conversation error:", error.message);
    throw error;
  }
}

/**
 * ✅ Get available models from OpenRouter
 */
async function getAvailableModels() {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Models API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Filter for free models
    const freeModels = data.data.filter(model => 
      model.id.includes(':free') || model.pricing?.prompt === 0
    );

    return {
      all_models: data.data.length,
      free_models: freeModels.length,
      models: freeModels.map(model => ({
        id: model.id,
        name: model.name,
        description: model.description,
        context_length: model.context_length,
        pricing: model.pricing
      }))
    };

  } catch (error) {
    console.error("❌ Error fetching models:", error.message);
    return {
      all_models: 0,
      free_models: 0,
      models: [],
      error: error.message
    };
  }
}

/**
 * ✅ Check API key balance/usage
 */
async function checkAPIUsage() {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/auth/key", {
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      throw new Error(`Usage API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      data: data
    };

  } catch (error) {
    console.error("❌ Error checking API usage:", error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  generateAIResponse,
  generatePersonaResponse,
  testConnection,
  generateResponseWithReasoning,
  continueConversationWithReasoning,
  getAvailableModels,
  checkAPIUsage
};