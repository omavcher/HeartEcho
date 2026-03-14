const LiveStoryModel = require("../models/LiveStoryModel");
const LiveStoryChat = require("../models/LiveStoryChat");
const User = require("../models/User");
const { generatePersonaResponse, generateAIResponse } = require("./openrouter-ai-model");

// Admin routes
exports.adminUpsertStoryModel = async (req, res) => {
  try {
    const { slug, title, storyInText, role, setting, instruction, description, category, views } = req.body;
    
    if (!slug || !title) {
      return res.status(400).json({ success: false, message: "Slug and title are required." });
    }

    const cdnUrl = "https://cdn.heartecho.in";
    const updateData = { slug, title, storyInText, role, setting, instruction, description, category };
    if (views) updateData.views = views;

    if (req.files) {
      if (req.files.poster && req.files.poster[0]) {
        updateData.poster = `${cdnUrl}/${req.files.poster[0].key}`;
      }
      if (req.files.banner && req.files.banner[0]) {
        updateData.banner = `${cdnUrl}/${req.files.banner[0].key}`;
      }
      if (req.files.story_movie && req.files.story_movie[0]) {
        updateData.story_movie = `${cdnUrl}/${req.files.story_movie[0].key}`;
      }
      if (req.files.chatting) {
        updateData.chatting = req.files.chatting.map(file => `${cdnUrl}/${file.key}`);
      }
    }

    let storyModel = await LiveStoryModel.findOne({ slug });
    
    if (storyModel) {
      Object.assign(storyModel, updateData);
      await storyModel.save();
    } else {
      storyModel = await LiveStoryModel.create(updateData);
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

// Public endpoints
exports.getPublicStories = async (req, res) => {
  try {
    const stories = await LiveStoryModel.find().select("-instruction -storyInText -role -setting"); // exclude AI specific text to make it lightweight
    res.json({ success: true, stories });
  } catch (error) {
    console.error("Error fetching public stories:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getPublicStoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const story = await LiveStoryModel.findOne({ slug }).select("-instruction -storyInText -role -setting");
    if (!story) return res.status(404).json({ success: false, message: "Story not found" });
    res.json({ success: true, story });
  } catch (error) {
    console.error("Error fetching public story:", error);
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
      quotaStatus: user.getQuotaStatus(),
      remainingQuota: user.getRemainingQuota(),
      isSubscribed: user.isSubscriptionActive()
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
        return res.status(403).json({
          success: false,
          requireLogin: false,
          quotaExhausted: true,
          message: "Daily quota exhausted.",
          quotaStatus: user.getQuotaStatus(),
          remainingQuota: user.getRemainingQuota(),
          isSubscribed
        });
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

    // Build lightweight user context so AI can treat the user as the main character
    let userContext = "";
    if (user) {
      const name = user.name || user.fullName || user.username || "";
      const city = user.city || user.location || "";
      const age = user.age || "";
      const gender = user.gender || "";

      userContext =
        "User Info: " +
        (name ? `Name: ${name}. ` : "") +
        (gender ? `Gender: ${gender}. ` : "") +
        (age ? `Age: ${age}. ` : "") +
        (city ? `City: ${city}. ` : "");
    }

    if (storyModel) {
      personaContext =
        `Title: ${storyModel.title}. ` +
        `Story Context / Plot: ${storyModel.storyInText}. ` +
        `Character Role (AI): ${storyModel.role}. ` +
        `Environment / Setting: ${storyModel.setting}. ` +
        `System Instructions: ${storyModel.instruction}. ` +
        `The user is the unnamed मुख्य पात्र of this कहानी. Speak to them in second person (तुम / आप) so they feel they are inside the scene. ` +
        `Target audience is Indian 18+ Hindi users. Keep the tone cinematic, भावनात्मक and immersive, with natural Hindi dialogues (देवनागरी) and light Hindi‑English mix where it feels real.` +
        (userContext ? ` ${userContext}` : "");
    } else {
      // A fallback context if Admin hasn't filled the data yet
      personaContext =
        "You are a cinematic story character chatting with the user. The user is the main character inside the scene. " +
        "Respond dramatically in Hindi with Devanagari script, mixed naturally with a bit of English, and keep the story flowing like a movie.";
    }

    // Add User Message
    const userMessage = { sender: "me", text, time: new Date() };
    chat.messages.push(userMessage);

    // Build prompt so the AI responds in character to the user's message and continues the story
    const recentMessages = chat.messages.slice(-10); // last 10 
    let promptHistory = recentMessages
      .map((m) => `${m.sender === "me" ? "User" : "You"}: ${m.text}`)
      .join("\n");

    let fullPrompt =
      `Recent chat history:\n${promptHistory}\n\n` +
      "Instruction: You are the story character and the user is living this कहानी as the मुख्य पात्र. " +
      "Use the system prompt persona (title, plot, role, setting, instructions, and user info) to stay fully in-character. " +
      "Reply only as the character, in a cinematic Hindi tone (देवनागरी) with natural emotions, and always move the कहानी forward based on the user's last message. " +
      "Do not explain that you are an AI or mention prompts/system messages. " +
      "Write only your reply (1–3 short chat-style messages, no speaker labels).\n\n" +
      "You (reply as the character):";

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
        remainingQuota: user.getRemainingQuota(),
        isSubscribed
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
