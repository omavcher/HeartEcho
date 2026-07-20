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

    if (!aiFriend) {
      return res.status(404).json({ success: false, message: "AI Companion not found" });
    }

    // Check premium restriction for Prebuilt AIs
    if (senderModel === "PrebuiltAIFriend" && aiFriend.isPremium) {
      const userProfile = await User.findById(userId);
      if (!userProfile || !userProfile.isSubscriptionActive()) {
        return res.status(403).json({
          success: false,
          message: "This AI Companion is restricted to premium subscribers.",
          isPremiumRestricted: true
        });
      }
    }

    // If chat doesn't exist yet, automatically initialize chat with her initial_message!
    if (!chat) {
      const initialGreeting = aiFriend.initial_message || aiFriend.greeting || `Hi there! 💕 I'm ${aiFriend.name}. I'm so happy to meet you!`;
      
      const newChat = new (mongoose.model("Chat"))({
        participants: [userId],
        aiParticipants: [aiFriendId],
        senderModel: senderModel,
        messages: [
          {
            senderId: aiFriendId,
            senderModel: senderModel,
            text: initialGreeting,
            createdAt: new Date()
          }
        ]
      });
      await newChat.save();
      chat = newChat;
    }

    return res.json({
      success: true,
      chat: chat,
      messageCount: chat.messages ? chat.messages.length : 0,
      aiFriend: {
        _id: aiFriend._id,
        name: aiFriend.name,
        gender: aiFriend.gender,
        avatar_img: aiFriend.avatar_img || aiFriend.avatar,
        initial_message: aiFriend.initial_message || aiFriend.greeting,
        description: aiFriend.description || aiFriend.bio,
        settings: aiFriend.settings,
        type: senderModel,
        isCustomAi: senderModel === "UserAIFriend"
      },
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

// GET /bots/custom-companion-quota - Check remaining custom AI creation quota for logged in user
router.get("/custom-companion-quota", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id.toString();
    const userProfile = await User.findById(req.user.id);

    if (!userProfile) {
      return res.status(404).json({ success: false, message: "User profile not found" });
    }

    const maxQuota = userProfile.getCustomAICreationQuota();
    const createdCount = await UserAIFriend.countDocuments({ userId: userId });
    const remainingQuota = Math.max(0, maxQuota - createdCount);

    return res.json({
      success: true,
      subscriptionTier: userProfile.subscriptionTier,
      maxQuota: maxQuota,
      createdCount: createdCount,
      remainingQuota: remainingQuota,
      canCreate: remainingQuota > 0
    });
  } catch (error) {
    console.error("Error checking custom companion quota:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
});

// POST /bots/custom-companion - Grok AI attribute analysis + OpenRouter seedream-4.5 image generation + UserAIFriend saving with quota checks
router.post("/custom-companion", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id.toString();
    const userProfile = await User.findById(req.user.id);

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found."
      });
    }

    // Quota Enforcement: Free/₹99 -> 0, ₹599 -> 1, ₹1499 -> 2
    const allowedQuota = userProfile.getCustomAICreationQuota();
    const existingCount = await UserAIFriend.countDocuments({ userId: userId });

    if (allowedQuota === 0) {
      return res.status(403).json({
        success: false,
        quotaExceeded: true,
        currentCount: existingCount,
        maxQuota: 0,
        message: "Custom AI Creation is locked on your current plan. Upgrade to the ₹599 Plan (1 AI Companion) or ₹1499 Pro Plan (2 AI Companions) to create your unique AI companion!"
      });
    }

    if (existingCount >= allowedQuota) {
      const upgradeMsg = allowedQuota === 1
        ? "You have reached your limit of 1 Custom AI Companion for the ₹599 Plan. Upgrade to the ₹1499 Pro Plan to create up to 2 companions!"
        : "You have reached the maximum limit of 2 Custom AI Companions for the ₹1499 Pro Plan.";

      return res.status(403).json({
        success: false,
        quotaExceeded: true,
        currentCount: existingCount,
        maxQuota: allowedQuota,
        message: upgradeMsg
      });
    }
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
    let grokProfile = {};
    try {
      grokProfile = await generateCompanionProfileWithGrok(rawAttributes);
    } catch (grokErr) {
      console.warn("⚠️ Grok AI profile synthesis warning, using raw attributes:", grokErr.message);
    }

    // Step 2: Generate Photorealistic Avatar using OpenRouter Image API (seedream-4.5) with Grok's detailed image_prompt
    const imagePromptToUse = grokProfile.image_prompt || 
      `A stunning photorealistic 8k studio portrait of a ${rawAttributes.gender} named ${rawAttributes.name}, ${rawAttributes.hairStyle} ${rawAttributes.hairColor} hair, ${rawAttributes.eyeColor} eyes, ${rawAttributes.bodyType} build, wearing ${rawAttributes.outfitStyle} outfit, cinematic lighting, masterpiece.`;

    let generatedAvatar = null;
    try {
      generatedAvatar = await generateImageWithOpenRouter(imagePromptToUse);
    } catch (imgErr) {
      console.warn("⚠️ OpenRouter image generation warning:", imgErr.message);
    }

    // Fallback if image generation is unavailable
    if (!generatedAvatar) {
      console.warn("⚠️ OpenRouter image generation unavailable, using fallback avatar image");
      generatedAvatar = fallbackAvatarUrl || (rawAttributes.gender === "female" 
        ? "assets/create/female/natural.jpg" 
        : "assets/create/male/natural.jpg");
    }

    // Step 3: Upload generated image directly to Cloudflare R2 bucket and get CDN link
    let cdnAvatarUrl = generatedAvatar;
    if (generatedAvatar && (generatedAvatar.startsWith("data:image/") || generatedAvatar.startsWith("http"))) {
      try {
        const { uploadBase64ToR2 } = require("../utils/s3Upload");
        console.log("☁️ Uploading generated avatar image to Cloudflare R2 bucket...");
        cdnAvatarUrl = await uploadBase64ToR2(generatedAvatar, "custom-avatars");
      } catch (r2Err) {
        console.warn("⚠️ Cloudflare R2 upload warning, using raw avatar URL:", r2Err.message);
      }
    }

    // Step 4: Save complete analyzed profile into private UserAIFriend DB Model
    const validUserObjectId = mongoose.Types.ObjectId.isValid(userId) ? userId : null;
    const finalAvatarImg = cdnAvatarUrl || fallbackAvatarUrl || (rawAttributes.gender === "female"
      ? "https://cdn.heartecho.in/custom-avatars/default_female.jpg"
      : "https://cdn.heartecho.in/custom-avatars/default_male.jpg");

    const newFriend = new UserAIFriend({
      userId: userId,
      user: validUserObjectId,
      gender: rawAttributes.gender,
      relationship: rawAttributes.relationship,
      interests: rawAttributes.traits,
      age: rawAttributes.age,
      name: rawAttributes.name,
      nickname: rawAttributes.nickname,
      description: grokProfile.description || rawAttributes.bio || rawAttributes.tagline || `A private ${rawAttributes.relationship} AI companion.`,
      settings: {
        ...(grokProfile.settings || {}),
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
      avatar_img: finalAvatarImg,
      isPrivate: true
    });

    await newFriend.save();
    console.log(`✅ Grok AI Pipeline completed! Private UserAIFriend saved for user [${userId}] with ID: ${newFriend._id}`);

    // Automatically initialize Chat session for the custom companion so she appears in chat friends list
    try {
      const Chat = require("../models/Chat");
      const initialMsgText = grokProfile.initial_message || rawAttributes.greeting || `Hi there! 💕 I'm ${rawAttributes.name}, your ${rawAttributes.relationship}. I'm so happy we connected! How was your day?`;
      const initialChat = new Chat({
        participants: [validUserObjectId || new mongoose.Types.ObjectId(userId)],
        aiParticipants: [newFriend._id],
        senderModel: "UserAIFriend",
        messages: [
          {
            sender: newFriend._id,
            senderModel: "UserAIFriend",
            text: initialMsgText,
            time: new Date()
          }
        ],
        statistics: {
          totalMessages: 1
        }
      });
      await initialChat.save();
      console.log(`💬 Initialized Chat session [${initialChat._id}] for custom companion ${newFriend.name}`);
    } catch (chatInitErr) {
      console.warn("⚠️ Warning initializing chat session for custom companion:", chatInitErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "AI Companion created successfully with Grok AI & OpenRouter Image API!",
      aiFriend: newFriend
    });

  } catch (error) {
    console.error("❌ Error creating custom companion:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create custom companion",
      error: error.message
    });
  }
});

// POST /bots/generate-custom-photo - Generate character-consistent photos for custom AI companions
router.post("/generate-custom-photo", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id.toString();
    const { aiFriendId, promptContext } = req.body;

    if (!aiFriendId || !mongoose.Types.ObjectId.isValid(aiFriendId)) {
      return res.status(400).json({ success: false, message: "Invalid AI Friend ID" });
    }

    const aiFriend = await UserAIFriend.findById(aiFriendId);
    if (!aiFriend) {
      return res.status(404).json({ success: false, message: "Custom AI Companion not found" });
    }

    // Security check: Only creator can request photos from their custom companion
    if (aiFriend.userId !== userId) {
      return res.status(403).json({ success: false, message: "Access Denied: This custom AI companion is private to its creator." });
    }

    const userProfile = await User.findById(req.user.id);
    const tier = userProfile ? (userProfile.subscriptionTier || "").toLowerCase() : "";
    const planAmount = userProfile ? (userProfile.subscriptionAmount || 0) : 0;

    // Gallery generation limits based on plan:
    // ₹1499 Plan -> 8 photos
    // ₹599 Plan -> 5 photos
    let maxGalleryLimit = 5;
    if (tier === "yearly_pro" || tier === "lifetime" || planAmount >= 1499) {
      maxGalleryLimit = 8;
    } else {
      maxGalleryLimit = 5;
    }

    const currentGallery = aiFriend.img_gallery || [];

    // IF GALLERY LIMIT REACHED: Re-serve random image from existing gallery
    if (currentGallery.length >= maxGalleryLimit) {
      console.log(`📸 Gallery limit reached (${currentGallery.length}/${maxGalleryLimit}) for Custom AI [${aiFriend.name}]. Serving from existing gallery.`);
      const randomIndex = Math.floor(Math.random() * currentGallery.length);
      const existingPhoto = currentGallery[randomIndex] || aiFriend.avatar_img;

      return res.json({
        success: true,
        imageUrl: existingPhoto,
        isFromGallery: true,
        limitReached: true,
        galleryCount: currentGallery.length,
        maxGalleryLimit: maxGalleryLimit,
        message: "Here is a photo from my album! 💕"
      });
    }

    // GENERATE NEW CHARACTER-CONSISTENT PHOTO WITH OPENROUTER SEEDREAM-4.5
    console.log(`🎨 Generating NEW consistent photo #${currentGallery.length + 1}/${maxGalleryLimit} for Custom AI [${aiFriend.name}]...`);

    const settings = aiFriend.settings || {};
    const gender = aiFriend.gender || "female";
    const name = aiFriend.name || "Companion";
    const hairStyle = settings.hairStyle || "soft hair";
    const hairColor = settings.hairColor || "";
    const eyeColor = settings.eyeColor || "";
    const skinTone = settings.skinTone || "fair";
    const bodyType = settings.bodyType || "fit";
    const defaultOutfit = settings.outfitStyle || "stylish outfit";

    const locationsAndPoses = [
      "sitting at a sunlit aesthetic coffee shop, smiling warmly at camera",
      "walking through a scenic autumn park, casual candid pose",
      "standing on a cozy apartment balcony at sunset, soft warm light",
      "enjoying a candlelit dinner at a stylish restaurant",
      "smiling at a golden hour beach boardwalk, breeze blowing hair",
      "relaxing in a cozy indoor lounge with fairy lights",
      "wearing a chic casual outfit, looking charmingly into camera",
      "outdoor portrait shot with soft bokeh background and natural lighting"
    ];

    const randomPose = promptContext || locationsAndPoses[currentGallery.length % locationsAndPoses.length];

    const photoPrompt = `A gorgeous photorealistic 8k studio photo of the exact same ${gender} named ${name}, ${hairStyle} ${hairColor} hair, ${eyeColor} eyes, ${skinTone} skin tone, ${bodyType} build, wearing ${defaultOutfit}, ${randomPose}, cinematic studio lighting, highly detailed portrait photography, 8k resolution, masterpiece.`;

    const generatedPhoto = await generateImageWithOpenRouter(photoPrompt);

    let cdnPhotoUrl = generatedPhoto;
    if (generatedPhoto && (generatedPhoto.startsWith("data:image/") || generatedPhoto.startsWith("http"))) {
      const { uploadBase64ToR2 } = require("../utils/s3Upload");
      cdnPhotoUrl = await uploadBase64ToR2(generatedPhoto, "custom-gallery");
    }

    if (!cdnPhotoUrl) {
      cdnPhotoUrl = aiFriend.avatar_img;
    }

    // Append to img_gallery array in MongoDB
    aiFriend.img_gallery.push(cdnPhotoUrl);
    await aiFriend.save();

    console.log(`✅ New Custom AI photo saved to Cloudflare R2 and DB (${aiFriend.img_gallery.length}/${maxGalleryLimit}): ${cdnPhotoUrl}`);

    return res.status(201).json({
      success: true,
      imageUrl: cdnPhotoUrl,
      isFromGallery: false,
      limitReached: false,
      galleryCount: aiFriend.img_gallery.length,
      maxGalleryLimit: maxGalleryLimit,
      message: "Here's a photo I just took for you! 📸✨"
    });

  } catch (error) {
    console.error("❌ Error generating custom AI photo:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate photo",
      error: error.message
    });
  }
});

module.exports = router;