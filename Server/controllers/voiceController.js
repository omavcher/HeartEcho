const axios = require('axios');
const User = require('../models/User');
const AIFriend = require('../models/AIFriend');
const PrebuiltAIFriend = require('../models/PrebuiltAIFriend');
const LetterAIFriend = require('../models/LetterAIFriend');
const AiLive = require('../models/AiLive');
const Chat = require('../models/Chat');
const mongoose = require('mongoose');

// Calculates roughly 15 seconds per volley (0.25 minutes)
const COST_PER_VOLLEY_MINUTES = 0.25;

exports.handleVoiceCall = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;
    const userId = req.user.id; // from authMiddleware

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "No audio text received." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // ── SUBSCRIBER GATE ──────────────────────────────────────────────────────
    // Voice calling is a paid feature. Monthly (₹49) does NOT include calls.
    // Only yearly (₹399, audioCallQuota=10) and yearly_pro (₹999, unlimited).
    const isSubscriber = user.user_type === "subscriber" && 
      user.subscriptionExpiry && new Date() <= new Date(user.subscriptionExpiry);
    
    if (!isSubscriber) {
      return res.status(403).json({
        success: false,
        reason: "subscriber_required",
        userTier: user.subscriptionTier || "none",
        message: "Voice calling requires an active subscription. Upgrade to Yearly or Ultimate plan."
      });
    }

    // ── CALL PLAN CHECK ──────────────────────────────────────────────────────
    // monthly (₹49) subscribers have audioCallQuota=0 → no calls allowed
    if ((user.audioCallQuota || 0) === 0) {
      return res.status(403).json({
        success: false,
        reason: "plan_upgrade_required",
        currentTier: user.subscriptionTier,
        message: "Your Monthly plan doesn't include voice calls. Upgrade to Yearly (₹399) or Ultimate (₹999)."
      });
    }

    // Robust AI Resolution: Search across all potential friend collections
    let aiFriend = null;
    let senderModelStr = "AIFriend";

    // 1. Try Custom AI Friend
    aiFriend = await AIFriend.findById(chatId);
    
    // 2. Try Prebuilt AI Friend
    if (!aiFriend) {
      aiFriend = await PrebuiltAIFriend.findById(chatId);
      senderModelStr = "PrebuiltAIFriend";
    }

    // 3. Try Letter AI Friend
    if (!aiFriend) {
      aiFriend = await LetterAIFriend.findById(chatId);
      senderModelStr = "LetterAIFriend";
    }

    // 4. Try AI Live Model
    if (!aiFriend) {
      aiFriend = await AiLive.findById(chatId);
      senderModelStr = "AiLive";
    }

    // 5. Check if chatId is actually a Chat Document ID
    if (!aiFriend) {
      const activeChat = await Chat.findById(chatId);
      if (activeChat && activeChat.aiParticipants) {
        // Resolve again using the AI ID from the chat session
        const actualAiId = activeChat.aiParticipants;
        aiFriend = await AIFriend.findById(actualAiId) || 
                   await PrebuiltAIFriend.findById(actualAiId) ||
                   await LetterAIFriend.findById(actualAiId) ||
                   await AiLive.findById(actualAiId);
        
        if (aiFriend) {
          // Determine model for history logging
          if (aiFriend.constructor.modelName) senderModelStr = aiFriend.constructor.modelName;
        }
      }
    }

    if (!aiFriend) {
      console.error(`❌ Calling Failed: No AI identity found for ID ${chatId}`);
      return res.status(404).json({ success: false, message: "AI Friend not found" });
    }

    // Determine Sarvam voice and prompt context based on AI characteristics
    // Valid Bulbul v3 speakers: shubh (M), ritu (F)
    const speakerId = aiFriend.gender === "male" ? "shubh" : "ritu";

    // --- Retrieve or create chat session to get recent history ---
    let chat = await Chat.findOne({ _id: chatId });
    if (!chat) {
       chat = await Chat.findOne({ participants: userId, aiParticipants: aiFriend._id });
    }
    if (!chat) {
      chat = new Chat({ participants: userId, aiParticipants: aiFriend._id, messages: [] });
    }

    // Get recent chat history (last 10 messages)
    const recentMessages = chat.messages.slice(-10);
    const chatHistory = recentMessages
      .map((msg) => {
        const senderName = msg.senderModel === "User" ? (user.name || "User") : aiFriend.name;
        return msg.text ? `${senderName}: ${msg.text}` : null;
      })
      .filter((msg) => msg !== null)
      .join("\n");

    const firstName = user.name ? user.name.split(" ")[0] : "User";
    const interests = user.selectedInterests ? user.selectedInterests.join(", ") : "Not specified";

    // Build the base system prompt containing AI's details and constraints
    const baseSystemPrompt = `You are ${aiFriend.name}, an Indian ${aiFriend.gender} persona.
Your Age: ${aiFriend.age || 'Not specified'}.
Your Relationship to the user: ${aiFriend.relationship || 'Friend'}.
Your Vibe: ${aiFriend.settings?.persona || 'friendly'}.
Your Background: ${aiFriend.description || 'Normal Indian background'}.

**User Context (use naturally if relevant):**
- Name: ${firstName}
- Age: ${user.age || 'Not specified'}
- City: ${user.city || 'Not specified'}
- Interests: ${interests}

**Voice Calling Constraints (CRITICAL):**
1. Keep your response extremely short (under 15-20 words, max 25 words) to ensure fast text-to-speech processing.
2. Speak naturally like a real human on a phone call. Avoid robotic phrasing or prefixes like "AI:" or "${aiFriend.name}:".
3. Do not use emojis (no emojis at all), since this text will be read aloud.
4. Adhere strictly to the script/language rules below.`;

    // Determine target language, script, and prompt context based on user preferredLanguage
    const userPreferredLang = user.preferredLanguage || "Hinglish";
    let targetLanguageCode = "hi-IN";
    let scriptInstruction = "";

    if (userPreferredLang === "English") {
      targetLanguageCode = "en-IN";
      scriptInstruction = `1. ALWAYS respond in PURE ENGLISH.\n2. Use the English alphabet/script.\n3. NEVER use Hindi or other Indian scripts.`;
    } else if (userPreferredLang === "Hinglish") {
      targetLanguageCode = "hi-IN";
      scriptInstruction = `1. ALWAYS respond in DEVANAGARI HINDI script (actual Hindi letters).\n2. Speak in conversational Hinglish (Mix of Hindi & English words), but write EVERYTHING using Devanagari script (e.g. write 'बिजी' for busy, 'क्यूट' for cute, 'थैंक यू' for thank you). NEVER use English/Latin alphabet.`;
    } else if (userPreferredLang === "Hindi") {
      targetLanguageCode = "hi-IN";
      scriptInstruction = `1. ALWAYS respond in DEVANAGARI HINDI script (actual Hindi letters).\n2. Use standard Hindi phrasing.\n3. NEVER use English/Latin letters.`;
    } else {
      const scriptMap = {
        "Bengali": { code: "bn-IN", name: "BENGALI script (actual Bengali letters)" },
        "Marathi": { code: "mr-IN", name: "MARATHI/DEVANAGARI script (actual Marathi letters)" },
        "Telugu": { code: "te-IN", name: "TELUGU script (actual Telugu letters)" },
        "Tamil": { code: "ta-IN", name: "TAMIL script (actual Tamil letters)" },
        "Gujarati": { code: "gu-IN", name: "GUJARATI script (actual Gujarati letters)" },
        "Urdu": { code: "ur-IN", name: "URDU script (actual Urdu letters)" },
        "Kannada": { code: "kn-IN", name: "KANNADA script (actual Kannada letters)" },
        "Odia": { code: "or-IN", name: "ODIA script (actual Odia letters)" },
        "Malayalam": { code: "ml-IN", name: "MALAYALAM script (actual Malayalam letters)" },
        "Punjabi": { code: "pa-IN", name: "PUNJABI/GURMUKHI script (actual Punjabi letters)" }
      };

      const langConfig = scriptMap[userPreferredLang];
      if (langConfig) {
        targetLanguageCode = langConfig.code;
        scriptInstruction = `1. ALWAYS respond in ${userPreferredLang} using the native ${langConfig.name}.\n2. NEVER use English/Latin letters or other scripts.`;
      } else {
        targetLanguageCode = "hi-IN";
        scriptInstruction = `1. ALWAYS respond in DEVANAGARI HINDI script.\n2. NEVER use English/Latin letters.`;
      }
    }

    const fullSystemPrompt = `${baseSystemPrompt}\n\n**LANGUAGE & SCRIPT RULE (MUST FOLLOW):**\n${scriptInstruction}`;

    // Build messages list for OpenRouter
    const openRouterMessages = [
      { role: "system", content: fullSystemPrompt }
    ];

    if (chatHistory) {
      openRouterMessages.push({ role: "system", content: `Recent chat history context:\n${chatHistory}` });
    }

    openRouterMessages.push({ role: "user", content: text });

    // --- 1. Check Quotas ---
    const userQuota = user.audioCallQuota || 0;
    const userMinutesUsed = user.audioCallMinutesUsedToday || 0;
    const isUnlimited = userQuota > 5000;
    
    if (!isUnlimited && userQuota > 0) {
      if (userMinutesUsed >= userQuota) {
        return res.status(403).json({
          success: false,
          reason: "quota_exceeded",
          message: "You've exhausted your 10-minute daily limit. Upgrade to Ultimate for unlimited calls!"
        });
      }
    }

    // --- 2. Call OpenRouter xAI (with Google Gemini fallback) ---
    let aiResponseText = "";
    try {
      const openRouterRes = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "x-ai/grok-4.3", 
          messages: openRouterMessages
        },
        {
          headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY || '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'}`,
            "Content-Type": "application/json"
          },
          timeout: 10000 // 10s timeout to prevent massive hangs
        }
      );
      aiResponseText = openRouterRes.data.choices[0].message.content;
    } catch (llmError) {
      console.warn("Primary LLM Error, trying fallback:", llmError.message);
      try {
        const openRouterRes = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: "x-ai/grok-4.3", 
            messages: openRouterMessages
          },
          {
            headers: {
              "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY || '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'}`,
              "Content-Type": "application/json"
            },
            timeout: 10000
          }
        );
        aiResponseText = openRouterRes.data.choices[0].message.content;
      } catch (fallbackError) {
        console.error("LLM Fallback Error:", fallbackError.message);
        return res.status(503).json({
          success: false,
          reason: "high_traffic",
          message: "OpenRouter: " + (fallbackError.response?.data?.error?.message || fallbackError.message)
        });
      }
    }

    // Clean up response: remove markdown symbols, parenthetical actions, and potential speaker prefixes
    let cleanedText = aiResponseText.trim();
    const namePrefixRegex = new RegExp(`^(AI|Assistant|Bot|System|User|You|${aiFriend.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}):\\s*`, 'i');
    cleanedText = cleanedText.replace(namePrefixRegex, '');
    cleanedText = cleanedText.replace(/[\*\_\~]+/g, ''); // Remove markdown bold/italic/tilde
    cleanedText = cleanedText.replace(/[\(\[\{].*?[\)\]\}]/g, ''); // Remove action/stage directions like (laughs)
    cleanedText = cleanedText.trim();

    // --- 3. Call Sarvam AI for Audio ---
    let audioBase64 = null;
    try {
      const sarvamRes = await axios.post(
        "https://api.sarvam.ai/text-to-speech",
        {
          inputs: [cleanedText],
          target_language_code: targetLanguageCode,
          speaker: speakerId,
          model: "bulbul:v3",
          speech_sample_rate: 24000,
          enable_preprocessing: true,
          pace: 1.1
        },
        {
          headers: {
            "api-subscription-key": process.env.SARVAM_KEY || 'sk_t2esh0lg_j6qnk6vSfTOayifzc5WtUTiN',
            "Content-Type": "application/json"
          },
          timeout: 15000
        }
      );
      
      // Get base64 audio directly from the JSON array
      if (sarvamRes.data && sarvamRes.data.audios && sarvamRes.data.audios.length > 0) {
        audioBase64 = sarvamRes.data.audios[0];
      } else {
        throw new Error("No audio returned from Sarvam.");
      }
    } catch (ttsError) {
      console.error("Sarvam TTS Error:", ttsError.response?.data || ttsError.message);
      return res.status(503).json({
        success: false,
        reason: "high_traffic",
        message: "SarvamTTS: " + (ttsError.response?.data?.message || ttsError.message)
      });
    }

    // --- 4. Deduct Quota ---
    if (!isUnlimited) {
      user.audioCallMinutesUsedToday = (user.audioCallMinutesUsedToday || 0) + COST_PER_VOLLEY_MINUTES;
      await user.save();
    }

    // --- 5. Save Calling History to Chat ---
    // User voice transcript message
    chat.messages.push({
      sender: userId,
      senderModel: "User",
      text: text,
      time: new Date(),
      mediaType: "text"
    });
    
    // AI voice response message (using cleanedText for history so it matches what they heard)
    chat.messages.push({
      sender: chatId,
      senderModel: senderModelStr,
      text: cleanedText,
      time: new Date(),
      mediaType: "text"
    });
    
    await chat.save();

    // --- 6. Return success ---
    return res.status(200).json({
      success: true,
      audioBase64: audioBase64,
      text: cleanedText,
      minutesUsed: user.audioCallMinutesUsedToday || 0,
      quotaTotal: user.audioCallQuota || 0
    });

  } catch (error) {
    console.error("Voice Handler Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
