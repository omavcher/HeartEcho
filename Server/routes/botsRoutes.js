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

    // Check premium restriction
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