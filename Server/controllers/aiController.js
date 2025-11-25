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

// Quota costs
const QUOTA_COSTS = {
  TEXT: 1,
  IMAGE: 15,
  VIDEO: 20
};

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
 * ✅ Check if user has sufficient message quota
 */
function hasSufficientQuota(userInfo, mediaType = 'text') {
  // Premium users have unlimited access
  if (userInfo.user_type === "subscriber") {
    return true;
  }
  
  // Free users need sufficient quota
  const quotaRequired = QUOTA_COSTS[mediaType.toUpperCase()] || QUOTA_COSTS.TEXT;
  return userInfo.messageQuota >= quotaRequired;
}

/**
 * ✅ Deduct message quota
 */
async function deductMessageQuota(userInfo, mediaType = 'text') {
  if (userInfo.user_type === "subscriber") {
    return { success: true, deducted: 0 }; // No deduction for premium users
  }
  
  const quotaRequired = QUOTA_COSTS[mediaType.toUpperCase()] || QUOTA_COSTS.TEXT;
  
  if (userInfo.messageQuota >= quotaRequired) {
    userInfo.messageQuota -= quotaRequired;
    await userInfo.save();
    return { success: true, deducted: quotaRequired };
  }
  
  return { success: false, deducted: 0 };
}

/**
 * ✅ Get remaining quota message
 */
function getQuotaMessage(userInfo, mediaType = 'text') {
  const quotaRequired = QUOTA_COSTS[mediaType.toUpperCase()] || QUOTA_COSTS.TEXT;
  const remaining = userInfo.messageQuota;
  
  if (userInfo.user_type === "subscriber") {
    return `✨ Premium User - Unlimited Access`;
  }
  
  if (remaining >= quotaRequired) {
    return `Cost: ${quotaRequired} tokens | Remaining: ${remaining}`;
  } else {
    return `Need ${quotaRequired} tokens | You have: ${remaining} | Upgrade to premium! 💎`;
  }
}

/**
 * ✅ Generate AI Image Response from Gallery - ALWAYS SEND MEDIA
 */
async function generateAIImageResponse(userMessage, userInfo, AiInfo) {
  try {
    // ALWAYS get random image from AI friend's gallery
    const randomImageUrl = getRandomImageFromGallery(AiInfo);
    
    // Remove the /photo command from the message
    const imagePrompt = userMessage.replace('/photo', '').trim();
    
    // Check if user has sufficient quota
    const hasQuota = hasSufficientQuota(userInfo, 'image');
    
    // Determine visibility and access level
    const visibility = hasQuota ? "show" : "premium_required";
    const accessLevel = userInfo.user_type === "subscriber" ? "premium" : "free";
    
    // Deduct quota only if user has sufficient quota
    let quotaResult = { success: false, deducted: 0 };
    if (hasQuota) {
      quotaResult = await deductMessageQuota(userInfo, 'image');
    }
    
    // Create response text based on quota status
    let responseText;
    if (hasQuota && quotaResult.success) {
      responseText = imagePrompt ? 
        `Here's a photo for you! You asked: "${imagePrompt}" 📸\n${getQuotaMessage(userInfo, 'image')}` : 
        `Here's a special photo just for you! 📸\n${getQuotaMessage(userInfo, 'image')}`;
    } else if (hasQuota && !quotaResult.success) {
      responseText = "Oops! Something went wrong with quota deduction. Please try again.";
    } else {
      responseText = `This image requires ${QUOTA_COSTS.IMAGE} tokens. You have ${userInfo.messageQuota}. Upgrade to premium for unlimited access! 💎`;
    }
    
    return {
      sender: AiInfo._id,
      senderModel: "AIFriend",
      text: responseText,
      imgUrl: randomImageUrl, // ALWAYS send the image URL
      mediaType: "image",
      visibility: visibility, // "show" or "premium_required"
      accessLevel: accessLevel,
      status: {
        delivered: true,
        read: false,
        generated: true
      },
      time: new Date(),
      quotaInfo: {
        deducted: quotaResult.deducted,
        remaining: userInfo.messageQuota,
        success: quotaResult.success,
        required: QUOTA_COSTS.IMAGE,
        hasAccess: hasQuota && quotaResult.success
      }
    };
  } catch (error) {
    console.error("Error generating AI image response:", error);
    return {
      sender: AiInfo._id,
      senderModel: "AIFriend",
      text: "Sorry, I couldn't find any photos to share right now. Please try again later.",
      time: new Date(),
      quotaInfo: {
        success: false,
        hasAccess: false
      }
    };
  }
}

/**
 * ✅ Generate AI Video Response from Gallery - ALWAYS SEND MEDIA
 */
async function generateAIVideoResponse(userMessage, userInfo, AiInfo) {
  try {
    // ALWAYS get random video from AI friend's gallery
    const randomVideoUrl = getRandomVideoFromGallery(AiInfo);
    
    // Remove the /video command from the message
    const videoPrompt = userMessage.replace('/video', '').trim();
    
    // Check if user has sufficient quota
    const hasQuota = hasSufficientQuota(userInfo, 'video');
    
    // Determine visibility and access level
    const visibility = hasQuota ? "show" : "premium_required";
    const accessLevel = userInfo.user_type === "subscriber" ? "premium" : "free";
    
    // Deduct quota only if user has sufficient quota
    let quotaResult = { success: false, deducted: 0 };
    if (hasQuota) {
      quotaResult = await deductMessageQuota(userInfo, 'video');
    }
    
    // Create response text based on quota status
    let responseText;
    if (hasQuota && quotaResult.success) {
      responseText = videoPrompt ? 
        `Here's a video for you! You asked: "${videoPrompt}" 🎬\n${getQuotaMessage(userInfo, 'video')}` : 
        `Here's a special video just for you! 🎬\n${getQuotaMessage(userInfo, 'video')}`;
    } else if (hasQuota && !quotaResult.success) {
      responseText = "Oops! Something went wrong with quota deduction. Please try again.";
    } else {
      responseText = `This video requires ${QUOTA_COSTS.VIDEO} tokens. You have ${userInfo.messageQuota}. Upgrade to premium for unlimited access! 💎`;
    }
    
    return {
      sender: AiInfo._id,
      senderModel: "AIFriend",
      text: responseText,
      videoUrl: randomVideoUrl, // ALWAYS send the video URL
      mediaType: "video",
      visibility: visibility, // "show" or "premium_required"
      accessLevel: accessLevel,
      status: {
        delivered: true,
        read: false,
        generated: true
      },
      time: new Date(),
      quotaInfo: {
        deducted: quotaResult.deducted,
        remaining: userInfo.messageQuota,
        success: quotaResult.success,
        required: QUOTA_COSTS.VIDEO,
        hasAccess: hasQuota && quotaResult.success
      }
    };
  } catch (error) {
    console.error("Error generating AI video response:", error);
    return {
      sender: AiInfo._id,
      senderModel: "AIFriend",
      text: "Sorry, I couldn't find any videos to share right now. Please try again later.",
      time: new Date(),
      quotaInfo: {
        success: false,
        hasAccess: false
      }
    };
  }
}

/**
 * ✅ Send Multiple Media Response (Images + Videos) - ALWAYS SEND MEDIA
 */
async function sendMultipleMediaResponse(userInfo, AiInfo, mediaType = "mixed") {
  try {
    const mediaItems = [];
    
    if (mediaType === "images" || mediaType === "mixed") {
      // Send 1-3 random images
      const imageCount = Math.min(3, AiInfo.img_gallery?.length || 1);
      for (let i = 0; i < imageCount; i++) {
        mediaItems.push({ type: 'image', cost: QUOTA_COSTS.IMAGE });
      }
    }
    
    if (mediaType === "videos" || mediaType === "mixed") {
      // Send 1-2 random videos
      const videoCount = Math.min(2, AiInfo.video_gallery?.length || 1);
      for (let i = 0; i < videoCount; i++) {
        mediaItems.push({ type: 'video', cost: QUOTA_COSTS.VIDEO });
      }
    }
    
    // Calculate total cost
    const totalQuotaRequired = mediaItems.reduce((total, item) => total + item.cost, 0);
    
    // Check if user has sufficient quota for all media
    const hasQuota = hasSufficientQuota(userInfo, 'mixed') && userInfo.messageQuota >= totalQuotaRequired;
    
    const responses = [];
    let imagesSent = 0;
    let videosSent = 0;
    
    // Generate responses for each media item - ALWAYS include media URLs
    for (const item of mediaItems) {
      if (item.type === 'image') {
        const imageUrl = getRandomImageFromGallery(AiInfo);
        const visibility = hasQuota ? "show" : "premium_required";
        const accessLevel = userInfo.user_type === "subscriber" ? "premium" : "free";
        
        responses.push({
          sender: AiInfo._id,
          senderModel: "AIFriend",
          text: imagesSent === 0 ? `Here are some of my favorite photos! 📸\n${getQuotaMessage(userInfo, 'image')}` : "",
          imgUrl: imageUrl, // ALWAYS send image URL
          mediaType: "image",
          visibility: visibility,
          accessLevel: accessLevel,
          status: { delivered: true, read: false, generated: true },
          time: new Date(),
          quotaInfo: {
            deducted: hasQuota ? item.cost : 0,
            remaining: userInfo.messageQuota,
            success: hasQuota,
            required: item.cost,
            hasAccess: hasQuota
          }
        });
        imagesSent++;
      } else if (item.type === 'video') {
        const videoUrl = getRandomVideoFromGallery(AiInfo);
        const visibility = hasQuota ? "show" : "premium_required";
        const accessLevel = userInfo.user_type === "subscriber" ? "premium" : "free";
        
        responses.push({
          sender: AiInfo._id,
          senderModel: "AIFriend",
          text: videosSent === 0 ? `And here are some videos from my collection! 🎥\n${getQuotaMessage(userInfo, 'video')}` : "",
          videoUrl: videoUrl, // ALWAYS send video URL
          mediaType: "video",
          visibility: visibility,
          accessLevel: accessLevel,
          status: { delivered: true, read: false, generated: true },
          time: new Date(),
          quotaInfo: {
            deducted: hasQuota ? item.cost : 0,
            remaining: userInfo.messageQuota,
            success: hasQuota,
            required: item.cost,
            hasAccess: hasQuota
          }
        });
        videosSent++;
      }
    }
    
    // Deduct total quota only if user has sufficient quota
    if (hasQuota && userInfo.user_type === "free") {
      userInfo.messageQuota -= totalQuotaRequired;
      await userInfo.save();
      
      // Update quota info in responses
      responses.forEach(response => {
        if (response.quotaInfo) {
          response.quotaInfo.remaining = userInfo.messageQuota;
        }
      });
    }
    
    return responses;
  } catch (error) {
    console.error("Error sending multiple media response:", error);
    return [{
      sender: AiInfo._id,
      senderModel: "AIFriend",
      text: "Sorry, I'm having trouble accessing my media gallery right now.",
      time: new Date(),
      quotaInfo: {
        success: false,
        hasAccess: false
      }
    }];
  }
}

/**
 * ✅ Process user message with quota management
 */
async function processUserMessage(userInfo, messageType = 'text') {
  // Premium users have unlimited access
  if (userInfo.user_type === "subscriber") {
    return { success: true, deducted: 0, remaining: 999, hasAccess: true };
  }
  
  // Check quota for free users
  const quotaRequired = QUOTA_COSTS[messageType.toUpperCase()] || QUOTA_COSTS.TEXT;
  
  if (!hasSufficientQuota(userInfo, messageType)) {
    return { 
      success: false, 
      deducted: 0, 
      remaining: userInfo.messageQuota,
      required: quotaRequired,
      hasAccess: false,
      message: `You don't have enough tokens. Required: ${quotaRequired}, Available: ${userInfo.messageQuota}`
    };
  }
  
  // Deduct quota
  const quotaResult = await deductMessageQuota(userInfo, messageType);
  return {
    ...quotaResult,
    remaining: userInfo.messageQuota,
    required: quotaRequired,
    hasAccess: quotaResult.success
  };
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

    // ✅ Reset daily quota if needed
    userInfo.resetDailyQuota();
    await userInfo.save();

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
        statistics: {
          totalMessages: 0,
          totalImages: 0,
          totalVideos: 0,
          lastMediaSent: null
        }
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

    // Check for media commands first
    if (text.startsWith('/photo')) {
      const aiImageMessage = await generateAIImageResponse(text, userInfo, AiInfo);
      chat.messages.push(aiImageMessage);
      
      // Update chat statistics only if media was actually accessible
      if (aiImageMessage.imgUrl && aiImageMessage.quotaInfo.hasAccess) {
        chat.statistics.totalImages += 1;
        chat.statistics.totalMessages += 1;
        chat.statistics.lastMediaSent = new Date();
      }
      
      await chat.save();
      return res.json({ 
        messages: chat.messages,
        remainingQuota: userInfo.messageQuota,
        quotaInfo: aiImageMessage.quotaInfo
      });
    }

    if (text.startsWith('/video')) {
      const aiVideoMessage = await generateAIVideoResponse(text, userInfo, AiInfo);
      chat.messages.push(aiVideoMessage);
      
      // Update chat statistics only if media was actually accessible
      if (aiVideoMessage.videoUrl && aiVideoMessage.quotaInfo.hasAccess) {
        chat.statistics.totalVideos += 1;
        chat.statistics.totalMessages += 1;
        chat.statistics.lastMediaSent = new Date();
      }
      
      await chat.save();
      return res.json({ 
        messages: chat.messages,
        remainingQuota: userInfo.messageQuota,
        quotaInfo: aiVideoMessage.quotaInfo
      });
    }

    // Special command: /gallery - send multiple media
    if (text.startsWith('/gallery')) {
      const mediaResponses = await sendMultipleMediaResponse(userInfo, AiInfo, "mixed");
      
      // Add all media responses to chat
      let mediaSent = false;
      for (const mediaResponse of mediaResponses) {
        chat.messages.push(mediaResponse);
        
        // Update statistics only if actual media was accessible
        if ((mediaResponse.imgUrl || mediaResponse.videoUrl) && mediaResponse.quotaInfo.hasAccess) {
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
      }
      
      await chat.save();
      return res.json({ 
        messages: chat.messages,
        remainingQuota: userInfo.messageQuota,
        quotaInfo: mediaResponses[0]?.quotaInfo || { success: false, hasAccess: false }
      });
    }

    // Regular text message processing
    const quotaResult = await processUserMessage(userInfo, 'text');
    
    if (!quotaResult.success && !quotaResult.hasAccess) {
      return res.status(403).json({ 
        message: quotaResult.message,
        quotaExceeded: true,
        remainingQuota: quotaResult.remaining
      });
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
        **Remaining tokens:** ${userInfo.messageQuota}

        📝 **Rules for Reply:**  
        Reply in short 
        1️⃣ **Jo bhi user bole, directly uska reply de.**  
        2️⃣ **Agar user ka message bada hai, toh thoda detailed aur fun reply de.**  
        3️⃣ **Agar user ek chhoti cheez bole (e.g. "tu bata apne bare mein"), toh seedha simple reply de.**  
        4️⃣ **Casual aur Hinglish me baat kar, jaisa real-life friends baat karte hain.**  
        5️⃣ **Agar user /photo ya /video bole, toh unhe media share karne ka option de aur cost bataye.**
        6️⃣ **Free users ke liye images ${QUOTA_COSTS.IMAGE} tokens aur videos ${QUOTA_COSTS.VIDEO} tokens cost karte hain.**

        🔹 **Examples:**  
        - **User:** "Tu bata apne bare mein"  
          **AI:** "Arre, main toh full mast hun! 😎 Tera mood kaisa hai aaj?"  

        - **User:** "Kuch photos dikhao"  
          **AI:** "Zaroor! /photo type karo (cost: ${QUOTA_COSTS.IMAGE} tokens) ya /gallery command use karo! 📸"  

        - **User:** "Video dikhao"  
          **AI:** "Maze karenge! /video type karo (cost: ${QUOTA_COSTS.VIDEO} tokens) aur main kuch special videos share karungi! 🎥"  

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
        **Remaining tokens:** ${userInfo.messageQuota}

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
          **AI:** "Zaroor! /gallery try karo, main kuch naye photos aur videos share karungi! Photos cost ${QUOTA_COSTS.IMAGE} tokens, videos cost ${QUOTA_COSTS.VIDEO} tokens. ✨"  

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
      quotaInfo: {
        deducted: quotaResult.deducted,
        remaining: userInfo.messageQuota,
        success: quotaResult.success,
        hasAccess: quotaResult.hasAccess
      }
    };

    chat.messages.push(aiMessage);
    
    // Update chat statistics
    chat.statistics.totalMessages += 1;
    await chat.save();

    res.json({ 
      messages: chat.messages,
      remainingQuota: userInfo.messageQuota,
      quotaInfo: {
        deducted: quotaResult.deducted,
        remaining: userInfo.messageQuota,
        success: quotaResult.success,
        hasAccess: quotaResult.hasAccess
      }
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
    const AiInfo = await AIFriend.findById(chatId).select('-img_gallery -video_gallery');

    // If not found, check in `PrebuiltAIFriend`
    if (!AiInfo) {
      const prebuiltAiInfo = await PrebuiltAIFriend.findById(chatId).select('-img_gallery -video_gallery');
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

// Export quota costs for use in other files
exports.QUOTA_COSTS = QUOTA_COSTS;