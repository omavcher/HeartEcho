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
    content: `${prompt}`
  },
  {
    role: "user",
    content: prompt   // <-- this is where the actual user message / starting prompt goes
  }
],
        max_tokens: 100,
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




module.exports = {
  generateAIResponse,
  generatePersonaResponse,
};