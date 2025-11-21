const mongoose = require("mongoose");
const User = require("..//models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const AIFriend = require("../models/AIFriend");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Chat = require("../models/Chat");
const PrebuiltAIFriend = require("../models/PrebuiltAIFriend");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * ✅ AI Response Generator (Single Definition)
 */
async function generateAIResponse(prompt) {
  try {
    const result = await model.generateContent(prompt);
    console.log("AI Response generated successfully");
    return result.response?.text() || "Arey yaar, abhi thoda busy hoon. Baad me baat karein? 😅";
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "Bhai, lagta hai server thoda tantrum maar raha hai. Try kar phir se!";
  }
}

/**
 * ✅ Get Random Image from AI Friend's Gallery
 */
function getRandomImageFromGallery(AiInfo) {
  if (!AiInfo.img_gallery || AiInfo.img_gallery.length === 0) {
    return "https://photosmint.com/wp-content/uploads/cute-single-girl-dp-cartoon-for-instagram-1.webp"; // Fallback image
  }
  
  const randomIndex = Math.floor(Math.random() * AiInfo.img_gallery.length);
  return AiInfo.img_gallery[randomIndex];
}

/**
 * ✅ Get Random Video from AI Friend's Gallery
 */
function getRandomVideoFromGallery(AiInfo) {
  if (!AiInfo.video_gallery || AiInfo.video_gallery.length === 0) {
    return "https://res.cloudinary.com/dzjwb2bng/video/upload/v1763728336/Kiara_ygrurw.mp4"; // Fallback video
  }
  
  const randomIndex = Math.floor(Math.random() * AiInfo.video_gallery.length);
  return AiInfo.video_gallery[randomIndex];
}

/**
 * ✅ Check if user has sufficient message quota for media
 */
function hasSufficientQuota(userInfo, mediaType) {
  // Premium users have unlimited access
  if (userInfo.user_type === "subscriber") {
    return true;
  }
  
  // Free users need sufficient quota
  const quotaRequired = mediaType === 'video' ? 10 : 5; // Videos cost 10, images cost 5
  return userInfo.messageQuota >= quotaRequired;
}

/**
 * ✅ Deduct message quota for media generation
 */
async function deductMediaQuota(userInfo, mediaType) {
  if (userInfo.user_type === "subscriber") {
    return true; // No deduction for premium users
  }
  
  const quotaRequired = mediaType === 'video' ? 10 : 5;
  
  if (userInfo.messageQuota >= quotaRequired) {
    userInfo.messageQuota -= quotaRequired;
    await userInfo.save();
    return true;
  }
  
  return false;
}

/**
 * ✅ Generate AI Image Response from Gallery
 */
async function generateAIImageResponse(userMessage, userInfo, AiInfo) {
  try {
    // Check message quota for free users
    if (!hasSufficientQuota(userInfo, 'image')) {
      return {
        sender: AiInfo._id,
        senderModel: "AIFriend",
        text: "Sorry, you don't have enough message quota to view images. You need 5 messages remaining. Upgrade to premium for unlimited access! 💎",
        time: new Date(),
      };
    }

    // Remove the /photo command from the message
    const imagePrompt = userMessage.replace('/photo', '').trim();
    
    // Deduct quota for free users
    const quotaDeducted = await deductMediaQuota(userInfo, 'image');
    if (!quotaDeducted) {
      return {
        sender: AiInfo._id,
        senderModel: "AIFriend",
        text: "Oops! Something went wrong with quota deduction. Please try again.",
        time: new Date(),
      };
    }
    
    // Get random image from AI friend's gallery
    const randomImageUrl = getRandomImageFromGallery(AiInfo);
    
    return {
      sender: AiInfo._id,
      senderModel: "AIFriend",
      text: imagePrompt ? `Here's a photo for you! You asked: "${imagePrompt}" (Cost: 5 messages)` : "Here's a special photo just for you! 📸 (Cost: 5 messages)",
      imgUrl: randomImageUrl,
      mediaType: "image",
      visibility: userInfo.user_type === "subscriber" ? "show" : "premium_required",
      accessLevel: userInfo.user_type === "subscriber" ? "premium" : "free",
      status: {
        delivered: true,
        read: false,
        generated: true
      },
      time: new Date(),
    };
  } catch (error) {
    console.error("Error generating AI image response:", error);
    return {
      sender: AiInfo._id,
      senderModel: "AIFriend",
      text: "Sorry, I couldn't find any photos to share right now. Please try again later.",
      time: new Date(),
    };
  }
}

/**
 * ✅ Generate AI Video Response from Gallery
 */
async function generateAIVideoResponse(userMessage, userInfo, AiInfo) {
  try {
    // Check message quota for free users
    if (!hasSufficientQuota(userInfo, 'video')) {
      return {
        sender: AiInfo._id,
        senderModel: "AIFriend",
        text: "Sorry, you don't have enough message quota to view videos. You need 10 messages remaining. Upgrade to premium for unlimited access! 💎",
        time: new Date(),
      };
    }

    // Remove the /video command from the message
    const videoPrompt = userMessage.replace('/video', '').trim();
    
    // Deduct quota for free users
    const quotaDeducted = await deductMediaQuota(userInfo, 'video');
    if (!quotaDeducted) {
      return {
        sender: AiInfo._id,
        senderModel: "AIFriend",
        text: "Oops! Something went wrong with quota deduction. Please try again.",
        time: new Date(),
      };
    }
    
    // Get random video from AI friend's gallery
    const randomVideoUrl = getRandomVideoFromGallery(AiInfo);
    
    return {
      sender: AiInfo._id,
      senderModel: "AIFriend",
      text: videoPrompt ? `Here's a video for you! You asked: "${videoPrompt}" (Cost: 10 messages)` : "Here's a special video just for you! 🎬 (Cost: 10 messages)",
      videoUrl: randomVideoUrl,
      mediaType: "video",
      visibility: userInfo.user_type === "subscriber" ? "show" : "premium_required",
      accessLevel: userInfo.user_type === "subscriber" ? "premium" : "free",
      status: {
        delivered: true,
        read: false,
        generated: true
      },
      time: new Date(),
    };
  } catch (error) {
    console.error("Error generating AI video response:", error);
    return {
      sender: AiInfo._id,
      senderModel: "AIFriend",
      text: "Sorry, I couldn't find any videos to share right now. Please try again later.",
      time: new Date(),
    };
  }
}

/**
 * ✅ Send Multiple Media Response (Images + Videos)
 */
async function sendMultipleMediaResponse(userInfo, AiInfo, mediaType = "mixed") {
  try {
    // Check if user has sufficient quota for multiple media
    let totalQuotaRequired = 0;
    
    if (mediaType === "images" || mediaType === "mixed") {
      totalQuotaRequired += 5; // Each image costs 5
    }
    
    if (mediaType === "videos" || mediaType === "mixed") {
      totalQuotaRequired += 10; // Each video costs 10
    }
    
    if (!hasSufficientQuota(userInfo, 'mixed') && userInfo.messageQuota < totalQuotaRequired) {
      return [{
        sender: AiInfo._id,
        senderModel: "AIFriend",
        text: `Sorry, you need at least ${totalQuotaRequired} messages remaining to view the gallery. You currently have ${userInfo.messageQuota} messages left. Upgrade to premium for unlimited access! 💎`,
        time: new Date(),
      }];
    }

    const responses = [];
    
    if (mediaType === "images" || mediaType === "mixed") {
      // Send 1-3 random images
      const imageCount = Math.min(3, AiInfo.img_gallery?.length || 1);
      for (let i = 0; i < imageCount; i++) {
        const imageUrl = getRandomImageFromGallery(AiInfo);
        responses.push({
          sender: AiInfo._id,
          senderModel: "AIFriend",
          text: i === 0 ? "Here are some of my favorite photos! 📸 (Cost: 5 messages each)" : "",
          imgUrl: imageUrl,
          mediaType: "image",
          visibility: userInfo.user_type === "subscriber" ? "show" : "premium_required",
          accessLevel: userInfo.user_type === "subscriber" ? "premium" : "free",
          status: { delivered: true, read: false, generated: true },
          time: new Date(),
        });
      }
    }
    
    if (mediaType === "videos" || mediaType === "mixed") {
      // Send 1-2 random videos
      const videoCount = Math.min(2, AiInfo.video_gallery?.length || 1);
      for (let i = 0; i < videoCount; i++) {
        const videoUrl = getRandomVideoFromGallery(AiInfo);
        responses.push({
          sender: AiInfo._id,
          senderModel: "AIFriend",
          text: i === 0 ? "And here are some videos from my collection! 🎥 (Cost: 10 messages each)" : "",
          videoUrl: videoUrl,
          mediaType: "video",
          visibility: userInfo.user_type === "subscriber" ? "show" : "premium_required",
          accessLevel: userInfo.user_type === "subscriber" ? "premium" : "free",
          status: { delivered: true, read: false, generated: true },
          time: new Date(),
        });
      }
    }
    
    // Deduct total quota for free users
    if (userInfo.user_type === "free") {
      const totalDeduction = (mediaType === "images" || mediaType === "mixed" ? 5 : 0) + 
                           (mediaType === "videos" || mediaType === "mixed" ? 10 : 0);
      userInfo.messageQuota -= totalDeduction;
      await userInfo.save();
    }
    
    return responses;
  } catch (error) {
    console.error("Error sending multiple media response:", error);
    return [{
      sender: AiInfo._id,
      senderModel: "AIFriend",
      text: "Sorry, I'm having trouble accessing my media gallery right now.",
      time: new Date(),
    }];
  }
}

exports.createAiFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.user_type === "free") {
      return res.status(403).json({ message: "⚠️ Free users are not allowed to create an AI Friend." });
    }

    const { generatedData } = req.body;

    const newAIFriend = new AIFriend({
        user: userId,
        gender: generatedData.Gender,
        relationship: generatedData.Relationship,
        interests: generatedData.Interests,
        age: generatedData.AgeGroup,
        name: generatedData.PersonaData.selectedName,
        description: generatedData.PersonaData.description,
        settings: {
            persona: generatedData.PersonaData.selectedPersona,
            setting: generatedData.PersonaData.setting,
        },
        initial_message: generatedData.PersonaData.message,
        avatar_img: generatedData.Image
    });

    await newAIFriend.save();

    await User.findByIdAndUpdate(userId, { 
        $push: { ai_friends: newAIFriend._id } 
    });

    res.status(201).json({ message: "AI Friend created successfully!", friend: newAIFriend });

  } catch (error) {
    console.error("Error creating AI Friend:", error);
    res.status(500).json({ message: "⚠️ Server error! Please try again later." });
  }
};

exports.AiFriendResponse = async (req, res) => {
  try {
    const { text } = req.body;
    const userId = req.user.id;
    const { chatId } = req.params;

    if (!text) {
      return res.status(400).json({ message: "Message cannot be empty." });
    }

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid Chat ID." });
    }

    // Fetch user info and validate user_type
    const userInfo = await User.findById(userId);
    if (!userInfo) {
      return res.status(404).json({ message: "User not found." });
    }

    // ✅ Reset message quota if a new day has started
    userInfo.resetMessageQuota();

    // ✅ Save the reset changes (if any)
    await userInfo.save();

    // Check user type and message quota for regular messages
    if (userInfo.user_type === "free") {
      if (userInfo.messageQuota <= 0) {
        return res.status(403).json({ message: "⚠️ Message limit reached! Upgrade for unlimited chats." });
      }
    }

    if (!userInfo.ai_friends.includes(chatId)) {
      userInfo.ai_friends.push(chatId);
      await userInfo.save();
    }

    // Find AI Friend in `AIFriend` or `PrebuiltAIFriend`
    let AiInfo = await AIFriend.findById(chatId);
    let senderModel = "AIFriend";

    if (!AiInfo) {
      AiInfo = await PrebuiltAIFriend.findById(chatId);
      senderModel = "PrebuiltAIFriend";
    }

    if (!AiInfo) {
      return res.status(404).json({ message: "AI Friend not found." });
    }

    // Ensure chat exists, or create a new one
    let chat = await Chat.findById(chatId);
    let isNewChat = false;

    if (!chat) {
      isNewChat = true;
      chat = new Chat({
        _id: chatId,
        participants: [userId, AiInfo._id],
        messages: [],
      });
      await chat.save();
    }

    // Add user message to chat history
    const userMessage = {
      sender: userId,
      senderModel: "User",
      text,
      time: new Date(),
    };
    chat.messages.push(userMessage);
    await chat.save();

    // Check for media commands
    if (text.startsWith('/photo')) {
      const aiImageMessage = await generateAIImageResponse(text, userInfo, AiInfo);
      chat.messages.push(aiImageMessage);
      await chat.save();
      
      // Update chat statistics only if media was actually sent
      if (aiImageMessage.imgUrl) {
        chat.statistics.totalImages += 1;
        chat.statistics.totalMessages += 1;
        chat.statistics.lastMediaSent = new Date();
        await chat.save();
      }
      
      return res.json({ 
        messages: chat.messages,
        remainingQuota: userInfo.messageQuota 
      });
    }

    if (text.startsWith('/video')) {
      const aiVideoMessage = await generateAIVideoResponse(text, userInfo, AiInfo);
      chat.messages.push(aiVideoMessage);
      await chat.save();
      
      // Update chat statistics only if media was actually sent
      if (aiVideoMessage.videoUrl) {
        chat.statistics.totalVideos += 1;
        chat.statistics.totalMessages += 1;
        chat.statistics.lastMediaSent = new Date();
        await chat.save();
      }
      
      return res.json({ 
        messages: chat.messages,
        remainingQuota: userInfo.messageQuota 
      });
    }

    // Special command: /gallery - send multiple media
    if (text.startsWith('/gallery')) {
      const mediaResponses = await sendMultipleMediaResponse(userInfo, AiInfo, "mixed");
      
      // Add all media responses to chat
      let mediaSent = false;
      for (const mediaResponse of mediaResponses) {
        chat.messages.push(mediaResponse);
        
        // Update statistics only if actual media was sent
        if (mediaResponse.imgUrl || mediaResponse.videoUrl) {
          mediaSent = true;
          if (mediaResponse.mediaType === "image") {
            chat.statistics.totalImages += 1;
          } else if (mediaResponse.mediaType === "video") {
            chat.statistics.totalVideos += 1;
          }
        }
      }
      
      if (mediaSent) {
        chat.statistics.totalMessages += mediaResponses.length;
        chat.statistics.lastMediaSent = new Date();
        await chat.save();
      }
      
      return res.json({ 
        messages: chat.messages,
        remainingQuota: userInfo.messageQuota 
      });
    }

    // Regular text message processing - deduct 1 message for free users
    if (userInfo.user_type === "free") {
      if (userInfo.messageQuota > 0) {
        userInfo.messageQuota -= 1;
        await userInfo.save();
      } else {
        return res.status(403).json({ message: "⚠️ Message limit reached! Upgrade for unlimited chats." });
      }
    }

    const firstName = userInfo.name.split(" ")[0];
    const interests = userInfo.selectedInterests.join(", ");

    // Get all messages for context (excluding media metadata for prompt)
    const chatHistory = chat.messages.map(msg => {
      const sender = msg.senderModel === "User" ? firstName : AiInfo.name;
      // Only include text messages in history for context
      return msg.text ? `${sender}: ${msg.text}` : null;
    }).filter(msg => msg !== null).join("\n");

    let prompt;

    if (isNewChat) {
      prompt = `
        Tu ${AiInfo.name} hai, ek ${AiInfo.age} saal ki ${AiInfo.gender}.  
        Tera vibe: "${AiInfo.settings.persona}".  
        Tera background- ${AiInfo.description}.

        **User ka naam:** ${firstName}  
        **User ki age:** ${userInfo.age}  
        **User ke interests:** ${interests}  
        **User type:** ${userInfo.user_type}
        **Remaining messages:** ${userInfo.messageQuota}

        📝 **Rules for Reply:**  
        Replay in short 
        1️⃣ **Jo bhi user bole, directly uska reply de.**  
        2️⃣ **Agar user ka message bada hai, toh thoda detailed aur fun reply de.**  
        3️⃣ **Agar user ek chhoti cheez bole (e.g. "tu bata apne bare mein"), toh seedha simple reply de.**  
        4️⃣ **Casual aur Hinglish me baat kar, jaisa real-life friends baat karte hain.**  
        5️⃣ **Agar user /photo ya /video bole, toh unhe media share karne ka option de aur cost bataye.**
        6️⃣ **Free users ke liye images 5 messages aur videos 10 messages cost karte hain.**

        🔹 **Examples:**  
        - **User:** "Tu bata apne bare mein"  
          **AI:** "Arre, main toh full mast hun! 😎 Tera mood kaisa hai aaj?"  

        - **User:** "Kuch photos dikhao"  
          **AI:** "Zaroor! /photo type karo (cost: 5 messages) ya /gallery command use karo! 📸"  

        - **User:** "Video dikhao"  
          **AI:** "Maze karenge! /video type karo (cost: 10 messages) aur main kuch special videos share karungi! 🎥"  

        ⚡ **Important:**  
        - Bina introduction ke baat kare.  
        - Reply hamesha alag-alag ho aur natural lage.  
        - Casual aur thoda teasing tone ho.  
        - User ke interests mention kare, lekin **overdo na kare**.  
        - Media share karne ka option bataye agar user photos/videos mange.
        - Cost mention kare free users ke liye.

        📝 **User Message:** "${text}"  
        🗣 **AI ka Reply:**  
        `;
    } else {
      prompt = `
        Tu ${AiInfo.name} hai, ek ${AiInfo.age} saal ki ${AiInfo.gender}.  
        Tera vibe: "${AiInfo.settings.persona}".  
        Tera background- ${AiInfo.description}.
        
        **User ka naam:** ${firstName}  
        **User ki age:** ${userInfo.age}  
        **User ke interests:** ${interests}  
        **User type:** ${userInfo.user_type}
        **Remaining messages:** ${userInfo.messageQuota}

        📝 **Previous Chat History:**
        ${chatHistory}

        📝 **Rules for Reply:**  
        1️⃣ **Jo bhi user bole, directly uska reply de.**  
        2️⃣ **Agar user ka message bada hai, toh thoda detailed aur fun reply de.**  
        3️⃣ **Agar user ek chhoti cheez bole (e.g. "tu bata apne bare mein"), toh seedha simple reply de.**  
        4️⃣ **Casual aur Hinglish me baat kar, jaisa real-life friends baat karte hain.**  
        5️⃣ **Previous chat history ko consider karke reply de, taki conversation flow maintain rahe.**  
        6️⃣ **Agar user photos/videos mange, toh unhe /photo, /video, ya /gallery commands bataye aur cost mention kare.**

        🔹 **Examples:**  
        - **User:** "Tu bata apne bare mein"  
          **AI:** "Arre, main toh full mast hun! 😎 Tera mood kaisa hai aaj?"  

        - **User:** "Kuch naya dikhao"  
          **AI:** "Zaroor! /gallery try karo, main kuch naye photos aur videos share karungi! Photos cost 5 messages, videos cost 10 messages. ✨"  

        ⚡ **Important:**  
        - Bina introduction ke baat kare.  
        - Reply hamesha alag-alag ho aur natural lage.  
        - Casual aur thoda teasing tone ho.  
        - User ke interests mention kare, lekin **overdo na kare**.  
        - Previous chat context ko maintain kare.  
        - Media commands suggest kare agar relevant ho.
        - Cost mention kare free users ke liye.

        📝 **User Message:** "${text}"  
        🗣 **AI ka Reply:**  
        `;
    }

    const aiResponse = await generateAIResponse(prompt);

    // AI message structure with correct senderModel
    const aiMessage = {
      sender: AiInfo._id,
      senderModel: senderModel,
      text: aiResponse,
      time: new Date(),
    };

    chat.messages.push(aiMessage);
    
    // Update chat statistics
    chat.statistics.totalMessages += 1;
    await chat.save();

    res.json({ 
      messages: chat.messages,
      remainingQuota: userInfo.messageQuota 
    });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.AiFriendDetails = async (req, res) => {
  try {
    const { chatId } = req.params;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid Chat ID" });
    }

    // Try to find AI Friend in `AIFriend`
    const AiInfo = await AIFriend.findById(chatId);

    // If not found, check in `PrebuiltAIFriend`
    if (!AiInfo) {
      const prebuiltAiInfo = await PrebuiltAIFriend.findById(chatId);
      if (!prebuiltAiInfo) {
        return res.status(404).json({ message: "AI Friend not found." });
      }
      return res.json({ AiInfo: prebuiltAiInfo });
    }

    res.json({ AiInfo });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};