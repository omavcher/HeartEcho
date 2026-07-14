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

    // 3. Format last 30 messages — trim AI messages to keep memory extraction payload lean
    const recentMessages = chat.messages.slice(-30);
    const conversationHistory = recentMessages
      .map(m => {
        const sender = m.senderModel === "User" || m.sender === "me" || m.sender === "guest" ? "User" : "AI";
        const text = (m.text || "").trim();
        if (!text) return null;
        // Trim AI messages to 120 chars to avoid huge conversation payloads
        const trimmed = sender === "AI" && text.length > 120 ? text.substring(0, 120) + '...' : text;
        return `${sender}: ${trimmed}`;
      })
      .filter(Boolean)
      .join("\n");

    const systemPrompt = `You are a memory extraction assistant for HeartEcho AI companion app.
Analyze the conversation and extract key facts about the USER ONLY.

EXISTING MEMORY:
${user.relationshipMemory || 'None'}

OUTPUT FORMAT (STRICT):
- Output ONLY a bullet list. Max 8 bullets. Each bullet max 10 words.
- Format: "• [fact]"
- Example bullets:
  • Name: Om, age 21, from Pune
  • Works at: college student, DBATU
  • Likes: pizza, gaming, cricket
  • Nickname he uses: Baby
  • Currently: preparing for exams
  • Mood/feelings: lonely, wants companionship
- Merge and update any overlapping facts from existing memory.
- Do NOT include greetings, explanations, or AI companion details.
- Only output the bullet list, nothing else.`;

    const requestBody = {
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Conversation:\n${conversationHistory}\n\nExtract memory bullets now.` }
      ],
      max_tokens: 150,
      temperature: 0.4
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
