const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const PrebuiltAIFriend = require("../models/PrebuiltAIFriend");
const femaleReplies = require("../data/femaleReplies");
const maleReplies = require("../data/maleReplies");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");
const mongoose = require("mongoose");
const { tierBasedRateLimiter } = require("../middleware/rateLimiter");

// Track sent messages per chat to avoid repetition
const chatMessageHistory = new Map();

// ─── BOT MESSAGE COOLDOWN ──────────────────────────────────────────────────
// Prevents the bot from spamming messages when the frontend calls too frequently.
// Key: "userId:aiFriendId"  Value: timestamp of last bot message sent
const botMessageCooldown = new Map();

// Cooldown window in milliseconds (5 minutes = no new bot message within this period)
const BOT_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

// For brand-new chats use a shorter cooldown (30 seconds) so the greeting
// can arrive quickly, but repeat calls within that window are still ignored.
const NEW_CHAT_COOLDOWN_MS = 30 * 1000; // 30 seconds


// Extract first name from full name
function getFirstName(fullName) {
  if (!fullName) return "Friend";
  const names = fullName.trim().split(/\s+/);
  return names[0];
}

// Get time-based replies for specific gender and language
function getTimeBasedReplies(gender, firstName, preferredLanguage) {
  const now = new Date();
  const hour = now.getHours();
  
  let timeSlot;
  if (hour >= 5 && hour < 12) {
    timeSlot = "morning";
  } else if (hour >= 12 && hour < 18) {
    timeSlot = "afternoon";
  } else {
    timeSlot = "night";
  }
  
  let timeReplies;
  if (gender === "female") {
    // Try user's preferred language, fall back to Hinglish
    const langKey = preferredLanguage || "Hinglish";
    const langData = femaleReplies[langKey] || femaleReplies["Hinglish"];
    timeReplies = langData[timeSlot] || femaleReplies["Hinglish"][timeSlot];
  } else {
    timeReplies = maleReplies[timeSlot];
  }
  
  // Replace {name.first} with actual first name
  return timeReplies.map(reply => reply.replace("{name.first}", firstName));
}

// Get regular replies for specific gender and language
function getRegularReplies(gender, firstName, preferredLanguage) {
  let regularReplies;
  if (gender === "female") {
    // Try user's preferred language, fall back to Hinglish
    const langKey = preferredLanguage || "Hinglish";
    const langData = femaleReplies[langKey] || femaleReplies["Hinglish"];
    regularReplies = langData["regular"] || femaleReplies["Hinglish"]["regular"];
  } else {
    regularReplies = maleReplies.regular;
  }
  
  // Replace {name.first} with actual first name
  return regularReplies.map(reply => reply.replace("{name.first}", firstName));
}

// Get random reply based on AI's gender and user's preferred language
function getRandomReply(gender, firstName, preferredLanguage) {
  const timeBasedReplies = getTimeBasedReplies(gender, firstName, preferredLanguage);
  const regularRepliesList = getRegularReplies(gender, firstName, preferredLanguage);
  
  // Combine time-based with regular replies (70% time-based, 30% regular)
  const allReplies = [...timeBasedReplies, ...regularRepliesList];
  return allReplies[Math.floor(Math.random() * allReplies.length)];
}

// Get a reply that hasn't been sent recently in this chat
function getFreshReply(chatId, gender, firstName, preferredLanguage) {
  const history = chatMessageHistory.get(chatId) || [];
  
  // Get time-based replies
  const timeBasedReplies = getTimeBasedReplies(gender, firstName, preferredLanguage);
  const regularRepliesList = getRegularReplies(gender, firstName, preferredLanguage);
  const allReplies = [...timeBasedReplies, ...regularRepliesList];
  
  // Filter out recently used replies
  const availableReplies = allReplies.filter(reply => !history.includes(reply));
  
  let selectedReply;
  
  if (availableReplies.length > 0) {
    // Use a fresh reply if available
    selectedReply = availableReplies[Math.floor(Math.random() * availableReplies.length)];
  } else {
    // If all replies have been used, reset history and pick a random one
    selectedReply = allReplies[Math.floor(Math.random() * allReplies.length)];
    chatMessageHistory.set(chatId, []);
  }
  
  // Add to history
  history.push(selectedReply);
  if (history.length > 50) { // Keep only last 50 messages
    history.shift();
  }
  chatMessageHistory.set(chatId, history);
  
  return selectedReply;
}



const UserAIFriend = require("../models/UserAIFriend");

// GET /bots/chat/:aiFriendId - Get chat by AI friend with privacy checks
router.get("/chat/:aiFriendId", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { aiFriendId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(aiFriendId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid AI Friend ID" 
      });
    }

    const chat = await Chat.findOne({
      participants: userId,
      isActive: true,
      $or: [
        { aiParticipants: aiFriendId },
        { participants: aiFriendId }
      ]
    });

    if (!chat) {
      return res.json({
        success: true,
        message: "No chat history found. Start a new conversation!",
        chat: null,
        messageCount: 0,
        exists: false
      });
    }

    // Lookup AI friend in order: UserAIFriend -> AIFriend -> PrebuiltAIFriend
    let aiFriend = await UserAIFriend.findById(aiFriendId);
    let senderModel = "UserAIFriend";

    if (aiFriend) {
      // Security Check: Only creator can access their private UserAIFriend
      if (aiFriend.isPrivate && aiFriend.userId !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: "Access Denied: This custom AI companion is private to its creator."
        });
      }
    } else {
      aiFriend = await mongoose.model("AIFriend").findById(aiFriendId);
      senderModel = "AIFriend";
      if (!aiFriend) {
        aiFriend = await PrebuiltAIFriend.findById(aiFriendId);
        senderModel = "PrebuiltAIFriend";
      }
    }

    // Check premium restriction for Prebuilt AIs
    if (senderModel === "PrebuiltAIFriend" && aiFriend && aiFriend.isPremium) {
      const userProfile = await User.findById(userId);
      if (!userProfile || !userProfile.isSubscriptionActive()) {
        return res.status(403).json({
          success: false,
          message: "This AI Companion is restricted to premium subscribers.",
          isPremiumRestricted: true
        });
      }
    }

    res.json({
      success: true,
      chat: chat,
      messageCount: chat.messages.length,
      aiFriend: aiFriend ? {
        _id: aiFriend._id,
        name: aiFriend.name,
        gender: aiFriend.gender,
        type: senderModel
      } : null,
      exists: true
    });

  } catch (error) {
    console.error("Error fetching chat by AI friend:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

// GET /bots/user-companions - Get all private custom companions created by user
router.get("/user-companions", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id.toString();
    const customFriends = await UserAIFriend.find({ userId: userId }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      customFriends: customFriends,
      totalCount: customFriends.length
    });
  } catch (error) {
    console.error("Error fetching user custom AI companions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch custom companions",
      error: error.message
    });
  }
});

const { generateImageWithOpenRouter, generateCompanionProfileWithGrok } = require("../controllers/openrouter-ai-model");

// POST /bots/custom-companion - Grok AI attribute analysis + OpenRouter seedream-4.5 image generation + UserAIFriend saving
router.post("/custom-companion", async (req, res) => {
  try {
    const userId = req.user ? req.user.id.toString() : (req.body.userId || "guest");
    const {
      gender,
      name,
      nickname,
      relationship,
      personalityVibe,
      age,
      ethnicity,
      height,
      hairStyle,
      hairColor,
      eyeColor,
      skinTone,
      bodyType,
      outfitStyle,
      voiceId,
      replyLength,
      replyStyle,
      emojiUsage,
      language,
      traits,
      tagline,
      bio,
      greeting,
      fallbackAvatarUrl
    } = req.body;

    console.log(`🚀 Starting AI Creation Pipeline for user [${userId}]: "${name}" (${gender}, ${relationship})`);

    const rawAttributes = {
      gender: (gender || "female").toLowerCase(),
      name: name || ((gender || "").toLowerCase() === "male" ? "Leo" : "Anaya"),
      nickname: nickname || "",
      relationship: relationship || "Girlfriend",
      personalityVibe: personalityVibe || "Romantic",
      age: age || 22,
      ethnicity: ethnicity || "Indian",
      height: height || "5ft 6in",
      hairStyle: hairStyle || "Soft Waves",
      hairColor: hairColor || "Black",
      eyeColor: eyeColor || "Hazel",
      skinTone: skinTone || "Fair",
      bodyType: bodyType || "Slim & Fit",
      outfitStyle: outfitStyle || "Casual Chic",
      voiceId: voiceId ?? 0,
      replyLength: replyLength ?? 1,
      replyStyle: replyStyle ?? 1,
      emojiUsage: emojiUsage ?? 2,
      language: language || "Hinglish (Default)",
      traits: traits || ["Romantic", "Caring"],
      tagline: tagline || "",
      bio: bio || "",
      greeting: greeting || ""
    };

    // Step 1: Analyze all raw data with Grok AI (x-ai/grok-4.3)
    const grokProfile = await generateCompanionProfileWithGrok(rawAttributes);

    // Step 2: Generate Photorealistic Avatar using OpenRouter Image API (seedream-4.5) with Grok's detailed image_prompt
    const imagePromptToUse = grokProfile.image_prompt || 
      `A stunning photorealistic 8k studio portrait of a ${rawAttributes.gender} named ${rawAttributes.name}, ${rawAttributes.hairStyle} ${rawAttributes.hairColor} hair, ${rawAttributes.eyeColor} eyes, ${rawAttributes.bodyType} build, wearing ${rawAttributes.outfitStyle} outfit, cinematic lighting, masterpiece.`;

    let generatedAvatar = await generateImageWithOpenRouter(imagePromptToUse);

    // Fallback if image generation is unavailable
    if (!generatedAvatar) {
      console.warn("⚠️ OpenRouter image generation unavailable, using fallback avatar image");
      generatedAvatar = fallbackAvatarUrl || (rawAttributes.gender === "female" 
        ? "assets/create/female/natural.jpg" 
        : "assets/create/male/natural.jpg");
    }

    // Step 3: Save complete analyzed profile into private UserAIFriend DB Model
    const newFriend = new UserAIFriend({
      userId: userId,
      user: req.user ? req.user.id : null,
      gender: rawAttributes.gender,
      relationship: rawAttributes.relationship,
      interests: rawAttributes.traits,
      age: rawAttributes.age,
      name: rawAttributes.name,
      nickname: rawAttributes.nickname,
      description: grokProfile.description || rawAttributes.bio || rawAttributes.tagline || `A private ${rawAttributes.relationship} AI companion.`,
      settings: {
        ...grokProfile.settings,
        personalityVibe: rawAttributes.personalityVibe,
        hairStyle: rawAttributes.hairStyle,
        hairColor: rawAttributes.hairColor,
        eyeColor: rawAttributes.eyeColor,
        skinTone: rawAttributes.skinTone,
        height: rawAttributes.height,
        ethnicity: rawAttributes.ethnicity,
        bodyType: rawAttributes.bodyType,
        outfitStyle: rawAttributes.outfitStyle,
        voiceId: rawAttributes.voiceId,
        replyLength: rawAttributes.replyLength,
        replyStyle: rawAttributes.replyStyle,
        emojiUsage: rawAttributes.emojiUsage,
        language: rawAttributes.language,
        customCreated: true,
        image_prompt: imagePromptToUse
      },
      initial_message: grokProfile.initial_message || rawAttributes.greeting || `Hi there! 💕 I'm ${rawAttributes.name}, your ${rawAttributes.relationship}. I'm so happy we connected! How was your day?`,
      avatar_img: generatedAvatar,
      isPrivate: true
    });

    await newFriend.save();
    console.log(`✅ Grok AI Pipeline completed! Private UserAIFriend saved with ID: ${newFriend._id}`);

    return res.status(201).json({
      success: true,
      message: "AI Companion created successfully with Grok AI & OpenRouter Image API!",
      aiFriend: newFriend
    });

  } catch (error) {
    console.error("❌ Error in AI Creation Pipeline:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate AI companion",
      error: error.message
    });
  }
});

module.exports = router;