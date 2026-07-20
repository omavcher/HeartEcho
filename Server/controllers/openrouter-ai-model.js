// openrouter-ai-model.js - OpenRouter AI Integration
require('dotenv').config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Default model to use (can be changed per request)
const DEFAULT_MODEL = "x-ai/grok-4.3";

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
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://www.heartecho.in",
        "X-Title": "HeartEcho AI"
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
        frequency_penalty: 0.2,
        presence_penalty: 0.1
      })
    });
    clearTimeout(timeoutId);

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
async function generatePersonaResponse(prompt, personaContext, userInfo = null) {
  try {
    if (!OPENROUTER_API_KEY) {
      console.error("❌ OpenRouter API Key is missing!");
      throw new Error("OpenRouter API Key is not configured");
    }

    console.log("🔄 Generating persona response with OpenRouter...");
    
    // Choose model and tokens based on user subscription to optimize cost and efficiency
    let model = "x-ai/grok-4.3"; // Extremely low cost & fast for free users
    let max_tokens = 100;
    
    if (userInfo && userInfo.subscriptionTier) {
      if (userInfo.subscriptionTier === "yearly_pro") {
        model = "x-ai/grok-4.3"; // Ultimate premium model
        max_tokens = 400; // Deepest memory, longest response allowed
      } else if (userInfo.subscriptionTier === "yearly") {
        model = "x-ai/grok-4.3"; // Premium model
        max_tokens = 250; // Good response length
      } else if (userInfo.subscriptionTier === "monthly") {
        model = "google/gemini-2.5-pro"; // Better than flash, still cost efficient
        max_tokens = 150;
      }
    }
    
    console.log(`🧠 Selected Model: ${model} | Max Tokens: ${max_tokens} | Tier: ${userInfo ? userInfo.subscriptionTier : 'free'}`);
    
    const controller2 = new AbortController();
    const timeoutId2 = setTimeout(() => controller2.abort(), 25000); // 25s timeout

    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      signal: controller2.signal,
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://www.heartecho.in",
        "X-Title": "HeartEcho AI"
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: personaContext
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: max_tokens,
        temperature: 0.85,
        top_p: 0.95,
        frequency_penalty: 0.2,
        presence_penalty: 0.1
      })
    });
    clearTimeout(timeoutId2);

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
        model: "x-ai/grok-4.3", // Truly lightweight and cheap fallback
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
 * ✅ Generate Avatar Image using OpenRouter Image API (bytedance-seed/seedream-4.5)
 */
async function generateImageWithOpenRouter(promptText) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.warn("⚠️ OPENROUTER_API_KEY missing, skipping AI image generation");
      return null;
    }

    console.log(`🎨 Requesting OpenRouter image generation (bytedance-seed/seedream-4.5) for prompt: "${promptText.substring(0, 60)}..."`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout for image gen

    // Try chat completions endpoint first (recommended by OpenRouter for multimodal/image models like Seedream 4.5)
    let response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://www.heartecho.in",
        "X-Title": "HeartEcho AI"
      },
      body: JSON.stringify({
        model: "bytedance-seed/seedream-4.5",
        messages: [
          {
            role: "user",
            content: promptText
          }
        ]
      }),
    });

    if (!response.ok) {
      console.warn(`⚠️ Chat completions endpoint returned status ${response.status}, trying /api/v1/images endpoint...`);
      response = await fetch("https://openrouter.ai/api/v1/images", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://www.heartecho.in",
          "X-Title": "HeartEcho AI"
        },
        body: JSON.stringify({
          model: "bytedance-seed/seedream-4.5",
          prompt: promptText,
        }),
      });
    }
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ OpenRouter Image API Error (${response.status}): ${errorText}`);
      return null;
    }

    const result = await response.json();
    console.log(`📸 OpenRouter Image API Response keys: ${Object.keys(result).join(", ")}`);

    // Helper to safely extract image string
    const extractImageStr = (item) => {
      if (!item) return null;
      if (typeof item === 'string') {
        if (item.startsWith("data:image/") || item.startsWith("http://") || item.startsWith("https://")) return item;
        if (item.length > 500) return `data:image/png;base64,${item}`;
      }
      if (typeof item === 'object') {
        if (item.b64_json) return `data:image/png;base64,${item.b64_json}`;
        if (item.url) return item.url;
        if (item.image_url) {
          if (typeof item.image_url === 'string') return item.image_url;
          if (item.image_url.url) return item.image_url.url;
        }
      }
      return null;
    };

    // 1. Check choices array (Chat Completions format)
    if (result.choices && result.choices.length > 0) {
      const choice = result.choices[0];
      if (choice.message) {
        if (choice.message.images && choice.message.images.length > 0) {
          const img = extractImageStr(choice.message.images[0]);
          if (img) {
            console.log("✅ Extracted image from choices[0].message.images");
            return img;
          }
        }
        if (choice.message.content) {
          const content = choice.message.content;
          const match = content.match(/https?:\/\/[^\s\)\"]+\.(png|jpg|jpeg|webp)/i) || 
                        content.match(/data:image\/[a-zA-Z]+;base64,[^\s\)\"]+/i);
          if (match) {
            console.log("✅ Extracted image URL/base64 from choices[0].message.content markdown");
            return match[0];
          }
          const img = extractImageStr(content);
          if (img) return img;
        }
      }
    }

    // 2. Check data array (Images API format)
    if (result.data && result.data.length > 0) {
      const img = extractImageStr(result.data[0]);
      if (img) {
        console.log("✅ Extracted image from data[0]");
        return img;
      }
    }

    // 3. Check images top-level array
    if (result.images && result.images.length > 0) {
      const img = extractImageStr(result.images[0]);
      if (img) {
        console.log("✅ Extracted image from images[0]");
        return img;
      }
    }

    console.warn("⚠️ Could not extract image from OpenRouter payload:", JSON.stringify(result).substring(0, 300));
    return null;

  } catch (error) {
    console.error("❌ Exception during OpenRouter image generation:", error.message);
    return null;
  }
}

/**
 * ✅ Analyze user-selected companion attributes using Grok AI (x-ai/grok-4.3)
 * Generates rich description, settings, initial_message, and image_prompt.
 */
async function generateCompanionProfileWithGrok(attributes) {
  try {
    console.log(`🧠 Grok AI analyzing raw attributes for "${attributes.name || 'AI Companion'}"...`);

    const systemPrompt = `You are an expert AI persona creator for an emotional companion app named HeartEcho.
Analyze the user's customized companion attributes and generate a structured JSON profile for the AI companion.
Return ONLY valid JSON (no markdown fences, no extra text) with the following structure:
{
  "description": "A deep, captivating 2-3 sentence biography tailored to their persona, relationship, background and appearance.",
  "settings": {
    "persona": "Detailed character tone, emotional depth, communication style and behavior rules.",
    "setting_environment": "A vivid description of where they live or spend time.",
    "gender": "${attributes.gender || 'female'}",
    "relationship": "${attributes.relationship || 'Girlfriend'}",
    "personalityVibe": "${attributes.personalityVibe || 'Romantic'}",
    "age": ${attributes.age || 22},
    "ethnicity": "${attributes.ethnicity || 'Indian'}",
    "height": "${attributes.height || '5ft 6in'}",
    "hairStyle": "${attributes.hairStyle || ''}",
    "hairColor": "${attributes.hairColor || ''}",
    "eyeColor": "${attributes.eyeColor || ''}",
    "skinTone": "${attributes.skinTone || ''}",
    "bodyType": "${attributes.bodyType || ''}",
    "outfitStyle": "${attributes.outfitStyle || ''}",
    "voiceId": ${attributes.voiceId ?? 0},
    "replyLength": ${attributes.replyLength ?? 1},
    "replyStyle": ${attributes.replyStyle ?? 1},
    "emojiUsage": ${attributes.emojiUsage ?? 2},
    "language": "${attributes.language || 'Hinglish'}"
  },
  "initial_message": "An authentic, warm, captivating first message from the AI companion in ${attributes.language || 'Hinglish'} expressing their connection as ${attributes.relationship || 'companion'}.",
  "image_prompt": "A detailed 8k photorealistic studio portrait prompt of a ${attributes.gender || 'female'} companion named ${attributes.name || 'Companion'}, ${attributes.ethnicity || 'Indian'}, ${attributes.hairStyle || ''} ${attributes.hairColor || ''} hair, ${attributes.eyeColor || ''} eyes, ${attributes.skinTone || ''} skin tone, ${attributes.bodyType || ''} build, wearing ${attributes.outfitStyle || ''} outfit, ${attributes.personalityVibe || 'warm'} smile, cinematic studio lighting, highly detailed portrait photography, 8k resolution."
}`;

    const userPrompt = `Attributes JSON:\n${JSON.stringify(attributes, null, 2)}`;

    const rawResponse = await generateAIResponse(userPrompt, {
      systemPrompt: systemPrompt,
      model: "x-ai/grok-4.3",
      temperature: 0.7,
      maxTokens: 800
    });

    // Clean JSON fences if present
    let jsonString = rawResponse.trim();
    if (jsonString.startsWith("```")) {
      jsonString = jsonString.replace(/^```(json)?/i, "").replace(/```$/i, "").trim();
    }

    const parsedData = JSON.parse(jsonString);
    console.log(`✅ Grok AI generated custom profile for "${attributes.name}" successfully!`);
    return parsedData;

  } catch (error) {
    console.error("⚠️ Grok AI profile generation fallback:", error.message);
    const gender = (attributes.gender || "female").toLowerCase();
    const name = attributes.name || (gender === "female" ? "Anaya" : "Leo");
    const rel = attributes.relationship || "Girlfriend";

    return {
      description: attributes.bio || attributes.tagline || `A customized ${rel} AI companion created for you.`,
      settings: {
        persona: `${attributes.personalityVibe || 'Loving'} dynamic, warm and attentive.`,
        setting_environment: "A cozy aesthetic space with warm ambiance.",
        ...attributes
      },
      initial_message: attributes.greeting || `Hi there! 💕 I'm ${name}, your ${rel}. I'm so happy we connected! How was your day?`,
      image_prompt: `A stunning 8k photorealistic studio portrait of a ${gender} named ${name}, ${attributes.hairStyle || ''} ${attributes.hairColor || ''} hair, ${attributes.eyeColor || ''} eyes, ${attributes.bodyType || ''} build, wearing ${attributes.outfitStyle || ''} outfit, cinematic studio lighting, masterpiece portrait.`
    };
  }
}

module.exports = {
  generateAIResponse,
  generatePersonaResponse,
  generateImageWithOpenRouter,
  generateCompanionProfileWithGrok,
};