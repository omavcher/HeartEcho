const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");
const PrebuiltAIFriend = require("../models/PrebuiltAIFriend");
const femaleReplies = require("../data/femaleReplies");
const maleReplies = require("../data/maleReplies");

// Track sent messages per chat to avoid repetition
const chatMessageHistory = new Map();

// Get random reply based on gender
function getRandomReply(gender) {
  const replies = gender === "female" ? femaleReplies : maleReplies;
  return replies[Math.floor(Math.random() * replies.length)];
}

// Get a reply that hasn't been sent recently in this chat
function getFreshReply(chatId, gender) {
  const history = chatMessageHistory.get(chatId) || [];
  const replies = gender === "female" ? femaleReplies : maleReplies;
  
  // Filter out recently used replies
  const availableReplies = replies.filter(reply => !history.includes(reply));
  
  let selectedReply;
  
  if (availableReplies.length > 0) {
    // Use a fresh reply if available
    selectedReply = availableReplies[Math.floor(Math.random() * availableReplies.length)];
  } else {
    // If all replies have been used, reset history and pick a random one
    selectedReply = replies[Math.floor(Math.random() * replies.length)];
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


// POST /bots/bots-message
router.post("/bots-message", async (req, res) => {
  try {
    const { chatId, userProfile } = req.body;
    
    if (!chatId || !userProfile) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing chatId or userProfile" 
      });
    }
    
    // Validate chat exists
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ 
        success: false, 
        message: "Chat not found" 
      });
    }
    
    // Validate userProfile has gender
    if (!userProfile.gender) {
      return res.status(400).json({ 
        success: false, 
        message: "User gender is required" 
      });
    }
    
    // Get AI participant from chat - check both aiParticipants and messages for AI
    let aiParticipant = null;
    let senderModel = "AIFriend";
    
    // First check aiParticipants array
    if (chat.aiParticipants && chat.aiParticipants.length > 0) {
      aiParticipant = chat.aiParticipants[0];
      senderModel = "AIFriend";
    } 
    // If no aiParticipants, check if there are any AI messages in the chat
    else if (chat.messages && chat.messages.length > 0) {
      // Find the first AI message to get the sender
      const aiMessage = chat.messages.find(msg => 
        msg.senderModel === "AIFriend" || msg.senderModel === "PrebuiltAIFriend"
      );
      
      if (aiMessage) {
        aiParticipant = aiMessage.sender;
        senderModel = aiMessage.senderModel;
      }
    }
    
    // If still no AI participant, we need to handle this case
    if (!aiParticipant) {
      console.log(`No AI participant found for chat ${chatId}. Creating fallback...`);
      
      // Try to find a PrebuiltAIFriend based on user's gender preference
      const genderPreference = userProfile.gender === "male" ? "female" : "male";
      const fallbackAI = await PrebuiltAIFriend.findOne({ gender: genderPreference });
      
      if (fallbackAI) {
        aiParticipant = fallbackAI._id;
        senderModel = "PrebuiltAIFriend";
        // Add to chat's aiParticipants for future use
        chat.aiParticipants.push(aiParticipant);
        await chat.save();
        console.log(`Added fallback AI ${fallbackAI.name} to chat ${chatId}`);
      } else {
        // Ultimate fallback - use a dummy ObjectId
        aiParticipant = new mongoose.Types.ObjectId();
        senderModel = "AIFriend";
        console.log(`Using dummy AI participant for chat ${chatId}`);
      }
    }
    
    // Decide reply strategy (contextual or fresh)
    let botMessage;
    const shouldUseContextual = Math.random() > 0.3; // 70% contextual, 30% fresh
    

      botMessage = getFreshReply(chatId, userProfile.gender);
    
    // Create bot message object
    const botMessageObj = {
      sender: aiParticipant,
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
      isBotMessage: true
    };
    
    // Add message to chat
    chat.messages.push(botMessageObj);
    chat.statistics.totalMessages += 1;
    chat.updatedAt = new Date();
    
    await chat.save();
    
    // Update last activity timestamp
    chatMessageHistory.set(chatId, chatMessageHistory.get(chatId) || []);
    
    // Log the bot message (optional)
    console.log(`[BOT] Chat: ${chatId}, User: ${userProfile.name}, Gender: ${userProfile.gender}, AI: ${aiParticipant}, Message: ${botMessage}`);
    
    res.json({
      success: true,
      message: botMessage,
      chatId: chatId,
      isContextual: shouldUseContextual,
      timestamp: new Date().toISOString(),
      aiParticipant: aiParticipant.toString(),
      senderModel: senderModel
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

// GET /bots/clear-history/:chatId (for testing)
router.get("/clear-history/:chatId", (req, res) => {
  const { chatId } = req.params;
  chatMessageHistory.delete(chatId);
  res.json({ 
    success: true, 
    message: `History cleared for chat ${chatId}` 
  });
});

// GET /bots/history-status (for debugging)
router.get("/history-status", (req, res) => {
  const status = Array.from(chatMessageHistory.entries()).map(([chatId, history]) => ({
    chatId,
    historyCount: history.length,
    recentMessages: history.slice(-5)
  }));
  
  res.json({ 
    success: true, 
    totalChats: chatMessageHistory.size,
    status 
  });
});

// GET /bots/debug-chat/:chatId (for debugging specific chat)
router.get("/debug-chat/:chatId", async (req, res) => {
  try {
    const { chatId } = req.params;
    
    const chat = await Chat.findById(chatId)
      .populate('participants', 'name email')
      .populate('aiParticipants', 'name gender relationship')
      .select('participants aiParticipants messages.statistics');
    
    if (!chat) {
      return res.status(404).json({ 
        success: false, 
        message: "Chat not found" 
      });
    }
    
    // Analyze chat structure
    const analysis = {
      chatId: chat._id,
      hasParticipants: chat.participants.length > 0,
      participants: chat.participants,
      hasAiParticipants: chat.aiParticipants.length > 0,
      aiParticipants: chat.aiParticipants,
      totalMessages: chat.messages ? chat.messages.length : 0,
      aiMessages: chat.messages ? chat.messages.filter(msg => 
        msg.senderModel === "AIFriend" || msg.senderModel === "PrebuiltAIFriend"
      ).length : 0,
      userMessages: chat.messages ? chat.messages.filter(msg => 
        msg.senderModel === "User"
      ).length : 0,
      chatMessageHistory: chatMessageHistory.get(chatId) || []
    };
    
    res.json({
      success: true,
      analysis
    });
    
  } catch (error) {
    console.error("Error in debug-chat:", error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error",
      error: error.message 
    });
  }
});

module.exports = router;