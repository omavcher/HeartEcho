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

// POST /bots/bots-message - Send a bot message (matching your real chat logic)
router.post("/bots-message", authMiddleware, tierBasedRateLimiter, async (req, res) => {
  try {
    const userId = req.user.id;
    const { aiFriendId } = req.body; // Changed from chatId to aiFriendId

    if (!aiFriendId) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing aiFriendId" 
      });
    }

    if (!mongoose.Types.ObjectId.isValid(aiFriendId)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid AI Friend ID" 
      });
    }

    const userProfile = await User.findById(userId);
    if (!userProfile) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Find AI Friend information
    let aiFriend = await mongoose.model("AIFriend").findById(aiFriendId);
    let senderModel = "AIFriend";
    
    if (!aiFriend) {
      aiFriend = await PrebuiltAIFriend.findById(aiFriendId);
      senderModel = "PrebuiltAIFriend";
    }
    
    if (!aiFriend) {
      return res.status(404).json({ 
        success: false, 
        message: "AI Friend not found" 
      });
    }

    // ✅ Find chat using your EXACT logic from getChatByAiFriend
    let chat = await Chat.findOne({
      participants: userId,
      isActive: true,
      $or: [
        { aiParticipants: aiFriendId }, // ✅ new correct structure
        { participants: aiFriendId }    // ⚠️ old broken structure
      ]
    });

    let isNewChat = false;

    // ❌ IF STILL NOT FOUND - Create new chat
    if (!chat) {
      isNewChat = true;
      
      chat = new Chat({
        participants: [userId],        // ✅ ONLY USER
        aiParticipants: [aiFriend._id],  // ✅ ONLY AI FRIEND
        messages: [],
        statistics: {
          totalMessages: 0,
          totalImages: 0,
          totalVideos: 0,
          lastMediaSent: null
        },
        isActive: true,
        archived: false
      });

      await chat.save();
      console.log(`✅ Created new chat ${chat._id} for user ${userId} and AI ${aiFriendId}`);
    } else {
      console.log(`✅ Found existing chat ${chat._id}`);
      
      // ⚠️ Auto-fix legacy chat structure (same as your controller)
      if (
        chat.aiParticipants.length === 0 &&
        chat.participants.some(
          id => id.toString() === aiFriendId.toString()
        )
      ) {
        console.log("🔧 Auto-fixing legacy chat:", chat._id);

        // Remove AI ID from participants
        chat.participants = chat.participants.filter(
          id => id.toString() !== aiFriendId.toString()
        );

        chat.aiParticipants = [aiFriendId];
        await chat.save();
        console.log("✅ Fixed legacy chat structure");
      }
    }

    // Extract user's first name for personalization
    const userFirstName = getFirstName(userProfile.name);
    
    // Get AI gender from the aiFriend object
    const aiGender = aiFriend.gender || "female"; // Default to female if not specified
    const aiName = aiFriend.name || "AI Friend";
    
    // Get user's preferred language (defaults to Hinglish)
    const userPreferredLanguage = userProfile.preferredLanguage || "Hinglish";

    // ─── COOLDOWN CHECK ──────────────────────────────────────────────────────
    // If the frontend calls too frequently, we still respond with a real message
    // (so the typing animation resolves correctly on both web & mobile) BUT we
    // do NOT save it to the database — preventing message spam in the chat.
    const cooldownKey = `${userId}:${aiFriendId}`;
    const lastSentAt = botMessageCooldown.get(cooldownKey);
    const now = new Date();
    const cooldownWindow = isNewChat ? NEW_CHAT_COOLDOWN_MS : BOT_COOLDOWN_MS;

    if (lastSentAt && (now.getTime() - lastSentAt) < cooldownWindow) {
      const secondsLeft = Math.ceil((cooldownWindow - (now.getTime() - lastSentAt)) / 1000);
      console.log(`[BOT][COOLDOWN] Throttled for user ${userId} / AI ${aiFriendId} — ${secondsLeft}s remaining. Returning reply without DB save.`);

      // Generate a reply in-memory (no DB write) so typing animation resolves properly
      const throttledReply = getFreshReply(chat._id.toString(), aiGender, userFirstName, userPreferredLanguage);

      // Simulate natural typing delay (2–4 seconds) so the animation feels real
      const typingDelay = Math.floor(Math.random() * 2000) + 2000; // 2000–4000 ms
      await new Promise(resolve => setTimeout(resolve, typingDelay));

      // Determine time of day for response shape
      const throttledHour = now.getHours();
      let throttledTimeOfDay = "morning";
      if (throttledHour >= 12 && throttledHour < 18) throttledTimeOfDay = "afternoon";
      if (throttledHour >= 18 || throttledHour < 5) throttledTimeOfDay = "night";

      return res.json({
        success: true,
        skipped: true,           // internal flag — frontend ignores unknown fields
        chat: chat,
        messageCount: chat.messages.length,
        botMessage: throttledReply,  // real message so animation & UI work correctly
        aiFriend: {
          _id: aiFriend._id,
          name: aiName,
          gender: aiGender,
          type: senderModel
        },
        user: {
          _id: userProfile._id,
          firstName: userFirstName,
          remainingQuota: userProfile.messageQuota - userProfile.messagesUsedToday
        },
        timestamp: now.toISOString(),
        isNewChat: false,
        timeOfDay: throttledTimeOfDay
      });
    }

    // Record this send time BEFORE generating the message so rapid concurrent
    // requests are also blocked (optimistic lock via in-memory map).
    botMessageCooldown.set(cooldownKey, now.getTime());
    // ────────────────────────────────────────────────────────────────────────

    let botMessage;
    
    if (isNewChat) {
      // For new chats, use a special greeting
      const timeBasedReplies = getTimeBasedReplies(aiGender, userFirstName, userPreferredLanguage);
      botMessage = timeBasedReplies[Math.floor(Math.random() * timeBasedReplies.length)];
    } else {
      // For existing chats, use the fresh reply system
      botMessage = getFreshReply(chat._id.toString(), aiGender, userFirstName, userPreferredLanguage);
    }
    
    // Create bot message object
    const botMessageObj = {
      sender: aiFriend._id,
      senderModel: senderModel,
      text: botMessage,
      time: new Date(),
      mediaType: "text",
      visibility: "show",
      accessLevel: "all",
      status: {
        delivered: true,
        read: false,
        generated: true
      },
      isBotMessage: true,
      quotaInfo: {
        deducted: false,
        remaining: userProfile.messageQuota - userProfile.messagesUsedToday,
        usedToday: userProfile.messagesUsedToday,
        dailyQuota: userProfile.messageQuota,
        success: true,
        hasAccess: true
      }
    };
    
    // Add message to chat
    chat.messages.push(botMessageObj);
    chat.statistics.totalMessages += 1;
    chat.updatedAt = new Date();
    
    await chat.save();
    
    // Update last activity timestamp in history tracking
    chatMessageHistory.set(chat._id.toString(), chatMessageHistory.get(chat._id.toString()) || []);
    
    // Get current time for logging (reuse `now` declared in the cooldown check above)
    const hour = now.getHours();
    let timeOfDay = "morning";
    if (hour >= 12 && hour < 18) timeOfDay = "afternoon";
    if (hour >= 18 || hour < 5) timeOfDay = "night";

    
    // Log the bot message
    console.log(`[BOT][${timeOfDay.toUpperCase()}] Chat: ${chat._id}, User: ${userProfile.name} (${userFirstName}), AI: ${aiName} (${aiGender}), Message: ${botMessage}, New Chat: ${isNewChat}`);
    
    // Return response matching your real chat format
    res.json({
      success: true,
      chat: chat,  // Return full chat object like your real controller
      messageCount: chat.messages.length,
      botMessage: botMessage,
      aiFriend: {
        _id: aiFriend._id,
        name: aiName,
        gender: aiGender,
        type: senderModel
      },
      user: {
        _id: userProfile._id,
        firstName: userFirstName,
        remainingQuota: userProfile.messageQuota - userProfile.messagesUsedToday
      },
      timestamp: new Date().toISOString(),
      isNewChat: isNewChat,
      timeOfDay: timeOfDay
    });
    
  } catch (error) {
    console.error("Error in bots-message endpoint:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: error.message 
    });
  }
});

// GET /bots/chat/:aiFriendId - Get chat by AI friend (same as your getChatByAiFriend)
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

    // Find chat using your EXACT logic
    const chat = await Chat.findOne({
      participants: userId,
      isActive: true,
      $or: [
        { aiParticipants: aiFriendId }, // ✅ new correct structure
        { participants: aiFriendId }    // ⚠️ old broken structure
      ]
    });

    console.log('chat-> ', chat);

    // ❌ IF STILL NOT FOUND
    if (!chat) {
      return res.json({
        success: true,
        message: "No chat history found. Start a new conversation!",
        chat: null,
        messageCount: 0,
        exists: false
      });
    }

    // ⚠️ Auto-fix legacy chat structure (same as your controller)
    if (
      chat.aiParticipants.length === 0 &&
      chat.participants.some(
        id => id.toString() === aiFriendId.toString()
      )
    ) {
      console.log("🔧 Auto-fixing legacy chat:", chat._id);

      // Remove AI ID from participants
      chat.participants = chat.participants.filter(
        id => id.toString() !== aiFriendId.toString()
      );

      chat.aiParticipants = [aiFriendId];
      await chat.save(); // 🔥 one-time silent fix
    }

    // Get AI friend details
    let aiFriend = await mongoose.model("AIFriend").findById(aiFriendId);
    let senderModel = "AIFriend";
    
    if (!aiFriend) {
      aiFriend = await PrebuiltAIFriend.findById(aiFriendId);
      senderModel = "PrebuiltAIFriend";
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

// GET /bots/all-chats - Get all chats for user
router.get("/all-chats", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all active chats for the user
    const chats = await Chat.find({
      participants: userId,
      isActive: true
    }).sort({ updatedAt: -1 }); // Latest first

    // Enrich each chat with AI friend details
    const enrichedChats = await Promise.all(
      chats.map(async (chat) => {
        let aiFriend = null;
        let aiName = "AI Friend";
        let aiGender = "female";
        let senderModel = "AIFriend";

        if (chat.aiParticipants && chat.aiParticipants.length > 0) {
          const aiId = chat.aiParticipants[0];
          
          // Try AIFriend first
          aiFriend = await mongoose.model("AIFriend").findById(aiId);
          if (!aiFriend) {
            // Try PrebuiltAIFriend
            aiFriend = await PrebuiltAIFriend.findById(aiId);
            senderModel = "PrebuiltAIFriend";
          }
          
          if (aiFriend) {
            aiName = aiFriend.name;
            aiGender = aiFriend.gender;
          }
        }

        return {
          _id: chat._id,
          aiFriend: aiFriend ? {
            _id: aiFriend._id,
            name: aiName,
            gender: aiGender,
            type: senderModel
          } : null,
          lastMessage: chat.messages.length > 0 
            ? chat.messages[chat.messages.length - 1] 
            : null,
          totalMessages: chat.messages.length,
          unreadCount: chat.messages.filter(msg => 
            msg.senderModel !== "User" && !msg.status.read
          ).length,
          updatedAt: chat.updatedAt,
          createdAt: chat.createdAt
        };
      })
    );

    res.json({
      success: true,
      chats: enrichedChats,
      totalChats: chats.length
    });

  } catch (error) {
    console.error("Error fetching all chats:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});

module.exports = router;