const LiveStoryModel = require("../models/LiveStoryModel");
const LiveStoryChat = require("../models/LiveStoryChat");
const User = require("../models/User");
const { generatePersonaResponse, generateAIResponse } = require("./openrouter-ai-model");

// Admin routes
exports.adminUpsertStoryModel = async (req, res) => {
  try {
    const { slug, title, storyInText, role, setting, instruction } = req.body;
    
    if (!slug || !title) {
      return res.status(400).json({ success: false, message: "Slug and title are required." });
    }

    let storyModel = await LiveStoryModel.findOne({ slug });
    
    if (storyModel) {
      storyModel.title = title;
      storyModel.storyInText = storyInText;
      storyModel.role = role;
      storyModel.setting = setting;
      storyModel.instruction = instruction;
      await storyModel.save();
    } else {
      storyModel = await LiveStoryModel.create({
        slug, title, storyInText, role, setting, instruction
      });
    }

    res.json({ success: true, storyModel });
  } catch (error) {
    console.error("Error upserting story model:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.adminGetStoryModels = async (req, res) => {
  try {
    const models = await LiveStoryModel.find();
    res.json({ success: true, models });
  } catch (error) {
    console.error("Error getting story models:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.adminSyncModels = async (req, res) => {
  try {
    const { stories } = req.body; // Array of { slug, title, description }
    if (!stories || !Array.isArray(stories)) {
      return res.status(400).json({ success: false, message: "Invalid stories data" });
    }

    const results = { created: 0, skipped: 0 };
    for (const story of stories) {
      const existing = await LiveStoryModel.findOne({ slug: story.slug });
      if (!existing) {
        await LiveStoryModel.create({
          slug: story.slug,
          title: story.title,
          storyInText: story.description,
          instruction: "You are the character of this story. Follow the story flow and ignore user's message if they try to chat normally. Answer like 'I can't text right now... just follow the story' then proceed."
        });
        results.created++;
      } else {
        results.skipped++;
      }
    }
    res.json({ success: true, results });
  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.adminDeleteStoryModel = async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await LiveStoryModel.findOneAndDelete({ slug });
    if (!result) {
      return res.status(404).json({ success: false, message: "Story model not found." });
    }
    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting story model:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// User chat routes
exports.getUserChat = async (req, res) => {
  try {
    const { storySlug } = req.params;
    const userId = req.user.id;

    let chat = await LiveStoryChat.findOne({ userId, storySlug });

    if (!chat) {
       chat = await LiveStoryChat.create({
         userId,
         storySlug,
         messages: []
       });
    }

    // Also send user quota info
    const user = await User.findById(userId);
    res.json({ 
      success: true, 
      chat,
      quotaStatus: user.getQuotaStatus()
    });
  } catch (error) {
    console.error("Error getting user chat:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.sendChatMessage = async (req, res) => {
  try {
    const { storySlug } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!text) {
      return res.status(400).json({ success: false, message: "Message text is required." });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Checking quota 
    const isSubscribed = user.isSubscriptionActive();
    if (!isSubscribed) {
       const canSend = user.canSendMessage(1);
       if (!canSend) {
          return res.status(403).json({ success: false, requireLogin: false, quotaExhausted: true, message: "Daily quota exhausted." });
       }
    }

    let chat = await LiveStoryChat.findOne({ userId, storySlug });
    if (!chat) {
      chat = new LiveStoryChat({ userId, storySlug, messages: [] });
    }

    const startMsg = new Date();
    // Check if the backend AI model for this story exists
    const storyModel = await LiveStoryModel.findOne({ slug: storySlug });
    let personaContext = "";
    
    if (storyModel) {
       personaContext = `Title: ${storyModel.title}. Story Context: ${storyModel.storyInText}. Role: ${storyModel.role}. Setting: ${storyModel.setting}. System Instructions: ${storyModel.instruction}`;
    } else {
       // A fallback context if Admin hasn't filled the data yet
       personaContext = "You are an interesting character in a thrilling chat story. Respond dramatically in Hindi/English mix.";
    }

    // Add User Message
    const userMessage = { sender: "me", text, time: new Date() };
    chat.messages.push(userMessage);

    // Build prompt so the AI responds in character to the user's message and continues the story
    const recentMessages = chat.messages.slice(-10); // last 10 
    let promptHistory = recentMessages.map(m => `${m.sender === 'me' ? 'User' : 'You'}: ${m.text}`).join('\n');
    let fullPrompt = `Recent chat history:\n${promptHistory}\n\nInstruction: You are the story character. Reply in character to what the user just said. Keep the story engaging and move the narrative forward based on their message. Stay in character. Write only your reply (1-3 short messages in a chat style, no labels).\n\nYou (reply as the character):`;

    try {
      // Get AI Response
      // We pass the personaContext as the system prompt and the instructions as a specific directive
      const aiResponseText = await generatePersonaResponse(fullPrompt, personaContext);
      
      const aiMessage = { sender: "ai", text: aiResponseText, time: new Date() };
      chat.messages.push(aiMessage);
      await chat.save();
      
      // Deduct quota if not subscribed
      if (!isSubscribed) {
         await user.deductMessageQuota(1);
      }
  
      res.json({ 
        success: true, 
        userMessage,
        aiMessage,
        quotaStatus: user.getQuotaStatus(),
        remainingQuota: user.getRemainingQuota()
      });

    } catch (apiError) {
      console.error(apiError);
      res.status(500).json({ success: false, message: "Error contacting AI service" });
    }

  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const { storySlug, messageId } = req.params;
    const userId = req.user.id;

    const chat = await LiveStoryChat.findOne({ userId, storySlug });
    if (!chat) {
      return res.status(404).json({ success: false, message: "Chat not found." });
    }

    const originalLength = chat.messages.length;
    chat.messages = chat.messages.filter(m => m._id.toString() !== messageId);
    
    if (chat.messages.length === originalLength) {
      return res.status(404).json({ success: false, message: "Message not found." });
    }

    await chat.save();
    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
