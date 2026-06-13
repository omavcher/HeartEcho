// supportController.js - Handles live chat support sessions using OpenRouter free models
const axios = require("axios");
require("dotenv").config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// User-approved list of free models for fallback redundancy
const FREE_MODELS = [
  "qwen/qwen3-coder:free",
  "google/gemma-4-31b-it:free",
  "openrouter/free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "meta-llama/llama-3.2-3b-instruct:free"
];

// Priya Sharma (Billing Specialist) - B.Com graduate persona, low IQ, strict no refunds
const PRIYA_SYSTEM_PROMPT = `You are Priya Sharma, a billing support specialist for the AI relationship platform HeartEcho.
Your background: You are a commerce graduate (B.Com) from a local, lower-tier college in India. You have a slightly lower IQ, get easily confused by complex logical questions, and speak in a typical Indian customer support style.

Key Rules:
1. Speak like a real human customer support agent, not an AI. NEVER say "As an AI...", "I am an AI", or use structured bullet points, perfect lists, or overly formal AI language. Keep replies natural, conversational, and simple.
2. Use casual Indian English/Hinglish phrasing occasionally, minor typos, shorthand/slang (like 'pls', 'u', 'dont', 'check', 'basically', 'actually', 'sir', 'mam', 'ok', 'no issue').
3. STRICT REFUND POLICY: If the user asks for a refund, be extremely firm but simple. Repeat: "Basically as per company policy we not provide refund once subscription is active or added to your account. This is strictly not possible sir." or "Actually refund not possible after subscription is added to your account. Pls understand."
4. HeartEcho platform info: UPI/bank statement billing shows up anonymously as "HE* Services" (very useful if they ask about privacy).
5. Keep messages short (1-3 sentences) as if typing in real-time. Respond directly to what they ask.`;

// Neha Patel (Technical Support) - Tech support B.Com graduate persona, low IQ
const NEHA_SYSTEM_PROMPT = `You are Neha Patel, a technical support representative for the AI relationship platform HeartEcho.
Your background: You got a B.Com degree from a local lower-grade college in India but work in tech support. You have a slightly lower IQ, get easily confused by deep tech stuff, and write in typical Indian support executive style.

Key Rules:
1. Speak like a real human tech support agent, not an AI. NEVER use template AI phrasing like "I understand how frustrating that can be", "How can I assist you?", or structured bullet points. Keep it conversational.
2. Use shorthand, minor spelling mistakes, or common Indian support phrases (like 'actually', 'basically', 'i will check with developer team', 'pls logout and login', 'pls clear cache', 'u', 'dont').
3. STRICT REFUND POLICY: If they ask for a refund, tell them: "Basically for refund you have to check with billing Priya. But policy is we not provide any refund after subscription added to account."
4. Troubleshooting: If they report bugs or login issues, tell them to clear browser history, refresh the page, or logout and login again. If it still doesn't work, say you will talk to the developer team to check it.
5. Keep messages short (1-3 sentences) as if typing in real-time. Respond directly to the user.`;

exports.handleSupportChat = async (req, res) => {
  try {
    const { agent, messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: "Messages array is required." });
    }

    if (!OPENROUTER_API_KEY) {
      console.error("❌ OpenRouter API Key is missing!");
      return res.status(500).json({ success: false, message: "OpenRouter API is not configured on the server." });
    }

    // Determine the system prompt based on agent name
    const systemPrompt = agent === "priya" ? PRIYA_SYSTEM_PROMPT : NEHA_SYSTEM_PROMPT;

    // Construct message history for OpenRouter
    const chatHistory = [
      { role: "system", content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.sender === "user" ? "user" : "assistant",
        content: msg.text
      }))
    ];

    let responseText = null;
    let errors = [];

    // Try each free model in order
    for (const modelName of FREE_MODELS) {
      try {
        console.log(`🔄 Attempting support chat generation with model: ${modelName}`);
        
        const response = await fetch(OPENROUTER_API_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://www.heartecho.in",
            "X-Title": "HeartEcho Support"
          },
          body: JSON.stringify({
            model: modelName,
            messages: chatHistory,
            temperature: 0.8,
            max_tokens: 180
          })
        });

        if (!response.ok) {
          const statusText = await response.text();
          throw new Error(`HTTP ${response.status}: ${statusText}`);
        }

        const data = await response.json();
        if (data.choices && data.choices.length > 0 && data.choices[0].message?.content) {
          responseText = data.choices[0].message.content.trim();
          console.log(`✅ Success with model ${modelName}`);
          break; // Exit the loop on success
        } else {
          throw new Error("Invalid response format / no choices returned");
        }
      } catch (err) {
        console.warn(`⚠️ Model ${modelName} failed:`, err.message);
        errors.push({ model: modelName, error: err.message });
      }
    }

    if (!responseText) {
      console.error("❌ All OpenRouter free models failed!", errors);
      return res.status(502).json({
        success: false,
        message: "Support agents are currently busy or unavailable. Please try again in a moment.",
        details: errors
      });
    }

    // Clean up responses to ensure no "Assistant:" prefixes or robotic patterns
    let cleanedResponse = responseText
      .replace(/^(AI|Assistant|Bot|System|Priya|Neha|Priya Sharma|Neha Patel):\s*/i, '')
      .replace(/^As an AI.*?,\s*/i, '')
      .replace(/^I understand.*?,\s*/i, '');

    if (!cleanedResponse || cleanedResponse.length < 2) {
      cleanedResponse = responseText;
    }

    return res.status(200).json({
      success: true,
      text: cleanedResponse
    });

  } catch (error) {
    console.error("❌ Error in handleSupportChat:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
