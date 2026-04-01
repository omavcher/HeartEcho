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

    // Optimized Prompt: Strictly Devanagari for Native Accent + Ultra-Concise for speed
    const contextPrompt = `You are ${aiFriend.name}, an Indian ${aiFriend.gender} persona (${aiFriend.relationship}). 
STRICT RULES:
1. ALWAYS respond in DEVANAGARI HINDI script (actual Hindi letters).
2. NEVER use English/Roman script. 
3. Keep response under 15-20 words to minimize processing time.
4. Speak like a real human, not a bot. Be seductive or friendly as per your role.`;


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

    // --- 2. Call OpenRouter xAI ---
    let aiResponseText = "";
    try {
      const openRouterRes = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          // We use grok-beta or a fast model
          model: "x-ai/grok-4.1-fast", 
          messages: [
            { role: "system", content: contextPrompt },
            { role: "user", content: text }
          ]
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
      console.error("LLM Error:", llmError.message);
      return res.status(503).json({
        success: false,
        reason: "high_traffic",
        message: "OpenRouter: " + (llmError.response?.data?.error?.message || llmError.message)
      });
    }

    // --- 3. Call Sarvam AI for Audio ---
    let audioBase64 = null;
    try {
      const sarvamRes = await axios.post(
        "https://api.sarvam.ai/text-to-speech",
        {
          inputs: [aiResponseText],
          target_language_code: "hi-IN",
          speaker: speakerId,
          model: "bulbul:v1",
          speech_sample_rate: 8000,
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
    // Search for existing chat session by ID (if chatId was the chat) OR by user/ai pair
    let chat = await Chat.findOne({ _id: chatId });
    if (!chat) {
       chat = await Chat.findOne({ participants: userId, aiParticipants: aiFriend._id });
    }
    
    if (!chat) {
      chat = new Chat({ participants: userId, aiParticipants: aiFriend._id, messages: [] });
    }
    
    // User voice transcript message
    chat.messages.push({
      sender: userId,
      senderModel: "User",
      text: text,
      time: new Date(),
      mediaType: "text"
    });
    
    // AI voice response message
    chat.messages.push({
      sender: chatId,
      senderModel: senderModelStr,
      text: aiResponseText,
      time: new Date(),
      mediaType: "text"
    });
    
    await chat.save();

    // --- 6. Return success ---
    return res.status(200).json({
      success: true,
      audioBase64: audioBase64,
      text: aiResponseText,
      minutesUsed: user.audioCallMinutesUsedToday || 0,
      quotaTotal: user.audioCallQuota || 0
    });

  } catch (error) {
    console.error("Voice Handler Error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
