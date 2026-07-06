const mongoose = require("mongoose");
const User = require("../models/User");

const freeModels = [
  "qwen/qwen3-coder:free",
  "google/gemma-4-31b-it:free",
  "openrouter/free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "meta-llama/llama-3.2-3b-instruct:free"
];

async function updateUserMemory(userId, chat) {
  try {
    // 1. Fetch user to verify subscription tier and status
    const user = await User.findById(userId);
    if (!user) return;

    const isPremiumYearlyOrUltimate = ["yearly", "yearly_pro"].includes(user.subscriptionTier) && user.isSubscriptionActive();
    if (!isPremiumYearlyOrUltimate) {
      return;
    }

    // 2. Throttling: Run memory generation every 10 messages
    if (!chat || !chat.messages || chat.messages.length === 0 || chat.messages.length % 10 !== 0) {
      return;
    }

    console.log(`[MemoryProcessor] Running background memory consolidation job for user ${userId} (messages: ${chat.messages.length})`);

    // 3. Format last 30 messages
    const recentMessages = chat.messages.slice(-30);
    const conversationHistory = recentMessages
      .map(m => {
        const sender = m.senderModel === "User" || m.sender === "me" || m.sender === "guest" ? "User" : "AI Companion";
        return `${sender}: ${m.text || ""}`;
      })
      .join("\n");

    const systemPrompt = `You are an expert relationship memory assistant for HeartEcho.
Your task is to analyze the recent conversation between the User and their AI companion, and update the User's memory.
Identify and extract important facts about the User. This includes:
- User's name, age, gender, location/city (if mentioned)
- User's likes, dislikes, favorite foods, hobbies, interests, job/studies
- Specific personal context (e.g., details about their girlfriend/boyfriend, family members, friends, or life events)
- Key relationship status or feelings expressed.

Combine these details with any existing memory context provided below:
Existing memory: "${user.relationshipMemory || 'None'}"

Write a concise, natural summary of the User in a few short paragraphs. Keep it brief and focused only on the most important facts. Do NOT return intro, explanation or conversational fillers, just the consolidated facts summary.`;

    const requestBody = {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Here is the recent conversation history:\n${conversationHistory}\n\nPlease generate the updated consolidated memory now.` }
      ],
      max_tokens: 300,
      temperature: 0.7
    };

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("[MemoryProcessor] Missing OPENROUTER_API_KEY");
      return;
    }

    let memoryUpdated = false;

    // Loop through free models as fallback
    for (const model of freeModels) {
      try {
        console.log(`[MemoryProcessor] Attempting memory extraction with model: ${model}`);
        
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://www.heartecho.in",
            "X-Title": "HeartEcho Memory Job"
          },
          body: JSON.stringify({
            model: model,
            ...requestBody
          })
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`OpenRouter HTTP ${response.status}: ${errText}`);
        }

        const data = await response.json();
        if (data && data.choices && data.choices.length > 0 && data.choices[0].message && data.choices[0].message.content) {
          const generatedMemory = data.choices[0].message.content.trim();
          if (generatedMemory.length > 10) {
            user.relationshipMemory = generatedMemory;
            await user.save();
            memoryUpdated = true;
            console.log(`[MemoryProcessor] Successfully updated memory for user ${userId} using model ${model}`);
            break; // Succeeded, exit loop!
          }
        }
      } catch (err) {
        console.warn(`[MemoryProcessor] Model ${model} failed: ${err.message}`);
      }
    }

    if (!memoryUpdated) {
      console.error(`[MemoryProcessor] Failed to update memory for user ${userId} using all free models.`);
    }

  } catch (error) {
    console.error("[MemoryProcessor] Unexpected error in memory job:", error);
  }
}

module.exports = {
  updateUserMemory
};
