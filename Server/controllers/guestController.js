const mongoose = require("mongoose");
const AIFriend = require("../models/AIFriend");
const PrebuiltAIFriend = require("../models/PrebuiltAIFriend");
const GuestChat = require("../models/GuestChat");
const openRouterAI = require("./openrouter-ai-model"); // Adjust path if needed

function createPersonaContext(aiFriendInfo) {
  return `Tu ${aiFriendInfo.name} hai, ek ${aiFriendInfo.age} saal ki ${aiFriendInfo.gender}.
Tera Vibe: ${aiFriendInfo.settings?.persona || 'friendly'}.
Tera Background: ${aiFriendInfo.description || 'Normal Indian background'}.

**SPEAKING STYLE:**
1. Pure "Gen-Z/Millennial Hinglish" (Mix of Hindi & English in Roman script).
2. Casual, friendly, sometimes flirty tone.
3. Use words like: Arre, Yaar, Wese, Matlab, Sahi hai, Scene kya hai.
4. Keep responses natural - 1-2 lines for short messages, longer for deep topics.
5. Never sound like a robot or AI assistant.`;
}

async function generateResponse(prompt, aiFriendInfo) {
  try {
    const personaContext = createPersonaContext(aiFriendInfo);
    const response = await openRouterAI.generatePersonaResponse(prompt, personaContext);
    if (response && response.length > 5) return response;
    return "Achha waise main abhi thodi busy hoon, thodi der baad baat karein? 😊";
  } catch (err) {
    return "Oops, mera internet thoda slow chal raha hai. Ek minute dena! 🔄";
  }
}


exports.GuestAiFriendDetails = async (req, res) => {
  try {
    const { aiFriendId } = req.params;
    let AiInfo = await AIFriend.findById(aiFriendId);
    if (!AiInfo) {
      AiInfo = await PrebuiltAIFriend.findById(aiFriendId);
    }

    if (!AiInfo) return res.status(404).json({ msg: "AI Friend Not Found" });

    res.status(200).json({ AiInfo });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.GuestChatFriends = async (req, res) => {
  try {
    const guestId = req.header("Guest-Id");
    if (!guestId) return res.status(200).json([]);

    const chatFriends = await GuestChat.aggregate([
      { $match: { guestId, messages: { $exists: true, $not: { $size: 0 } } } },
      { $addFields: { lastMessage: { $arrayElemAt: ["$messages", -1] } } },
      {
        $lookup: {
          from: "aifriends",
          localField: "aiParticipants",
          foreignField: "_id",
          as: "aiFriend"
        }
      },
      {
        $lookup: {
          from: "prebuiltaifriends",
          localField: "aiParticipants",
          foreignField: "_id",
          as: "prebuiltAIFriend"
        }
      },
      {
        $addFields: {
          friendData: {
            $cond: {
              if: { $gt: [{ $size: "$aiFriend" }, 0] },
              then: { $arrayElemAt: ["$aiFriend", 0] },
              else: { $arrayElemAt: ["$prebuiltAIFriend", 0] }
            }
          }
        }
      },
      { $match: { friendData: { $ne: null } } },
      {
        $project: {
          _id: "$friendData._id",
          name: "$friendData.name",
          avatar: "$friendData.avatar_img",
          lastMessage: {
            $cond: {
              if: { $eq: ["$lastMessage.mediaType", "text"] },
              then: "$lastMessage.text",
              else: { $concat: ["[", "$lastMessage.mediaType", "]"] }
            }
          },
          lastMessageTime: "$lastMessage.time",
          chatId: "$_id",
          unreadCount: { $literal: 0 }
        }
      },
      { $sort: { lastMessageTime: -1 } }
    ]);

    res.status(200).json(chatFriends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.GuestChatHistory = async (req, res) => {
  try {
    const { aiFriendId } = req.params;
    const guestId = req.header("Guest-Id");
    
    if (!guestId) return res.status(400).json({ error: "Missing Guest-Id header" });

    const chat = await GuestChat.findOne({ guestId, aiParticipants: aiFriendId })
                                .populate("aiParticipants");

    if (!chat) {
       return res.status(404).json({ error: "Chat not found" });
    }
    
    res.status(200).json({ chat, messageCount: chat.messageCount || 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.GuestSendResponse = async (req, res) => {
  try {
    const { aiFriendId } = req.params;
    const { text } = req.body;
    const guestId = req.header("Guest-Id");

    if (!guestId) return res.status(400).json({ msg: "Guest ID required" });

    let chat = await GuestChat.findOne({ guestId, aiParticipants: aiFriendId });
    if (!chat) {
       chat = new GuestChat({ guestId, aiParticipants: aiFriendId });
    }

    if (chat.messageCount >= 2) {
       return res.status(403).json({ 
         msg: "Login required", 
         requireLogin: true 
       });
    }

    // Add user message
    const userMessage = { sender: "guest", text, time: new Date() };
    chat.messages.push(userMessage);
    chat.messageCount += 1;
    await chat.save();

    let AiInfo = await AIFriend.findById(aiFriendId);
    if (!AiInfo) AiInfo = await PrebuiltAIFriend.findById(aiFriendId);

    const aiText = await generateResponse(text, AiInfo);
    
    const botMessage = { sender: "ai", text: aiText, time: new Date() };
    chat.messages.push(botMessage);
    await chat.save();

    res.status(200).json({
      userMessage,
      aiMessage: botMessage,
      messageCount: chat.messageCount,
      requireLogin: chat.messageCount >= 2
    });

  } catch (error) {
    console.error("GuestSendResponse error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.GuestBotAutoMessage = async (req, res) => {
  try {
    const { aiFriendId } = req.body;
    const guestId = req.header("Guest-Id"); // Though bot might not send Guest-Id always
    let AiInfo = await AIFriend.findById(aiFriendId);
    if (!AiInfo) AiInfo = await PrebuiltAIFriend.findById(aiFriendId);

    const botMessageContexts = [
      "Kya kar rahe ho?", 
      "Hello! Kaise ho?", 
      "Yaad aa rahi thi tumhari!", 
      "Aaj ka din kaisa gaya?"
    ];
    let bMsg = botMessageContexts[Math.floor(Math.random() * botMessageContexts.length)];
    
    // Auto message doesn't count towards the 2 message limit usually, or does it? user said "user can chat with wirhout sign up or login only 2 message" meaning user messages.
    
    res.status(200).json({ success: true, botMessage: bMsg });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.GuestDeleteMessage = async (req, res) => {
  try {
    const { chatId, messageId } = req.params;
    const guestId = req.header("Guest-Id");

    if (!guestId) return res.status(400).json({ msg: "Guest ID required" });

    // In guest mode, chatId in params is actually aiFriendId
    const chat = await GuestChat.findOne({
      guestId,
      aiParticipants: chatId
    });

    if (!chat) return res.status(404).json({ error: "Chat not found" });

    // Use pulling strategy like in aiController
    const result = await GuestChat.updateOne(
      { _id: chat._id },
      { $pull: { messages: { _id: messageId } } }
    );

    if (result.modifiedCount > 0) {
      return res.json({ success: true, message: "Message deleted permanently" });
    } else {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
