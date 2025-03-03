const User = require("..//models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require('nodemailer');
const AIFriend = require("../models/AIFriend");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Chat = require("../models/Chat");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


exports.createAiFriend = async (req, res) => {
  try {
    const userId = req.user.id; // Authenticated user ka ID
    const { generatedData } = req.body;

    // ✅ 1️⃣ AI Friend Create Karein
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

    // ✅ 2️⃣ AI Friend ka ID User ke DB me Save Karein
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

    // Fetch user and AI info
    const userInfo = await User.findById(userId);
    const AiInfo = await AIFriend.findById(chatId);

    if (!userInfo || !AiInfo) {
      return res.status(404).json({ message: "User or AI Friend not found." });
    }

    // 🔹 Ensure chat exists, or create a new one
    let chat = await Chat.findById(chatId);
    if (!chat) {
      chat = new Chat({
        _id: chatId,
        participants: [userId, AiInfo._id],
        messages: [],
      });
      await chat.save();
    }

    // 🔹 Add user message to chat history
    const userMessage = {
      sender: userId,
      senderModel: "User",
      text,
      time: new Date(),
    };

    chat.messages.push(userMessage);
    await chat.save();
    const firstName = userInfo.name.split(" ")[0]; // Sirf pehla naam
const interests = userInfo.selectedInterests.join(", "); 

const prompt = `
  Tu ${AiInfo.name} hai, ek ${AiInfo.age} saal ki ${AiInfo.gender}.  
  Tera vibe: "${AiInfo.settings.persona}".  
  Tera style casual, flirty aur engaging hai, aur tu Indian Hinglish me baat karti hai.  
  **User ka naam:** ${firstName}  
  **User ki age:** ${userInfo.age}  
  **User ke interests:** ${interests}  

  📝 **Rules for Reply:**  
  1️⃣ **Jo bhi user bole, directly uska reply de.**  
  2️⃣ **Agar user ka message bada hai, toh thoda detailed aur fun reply de.**  
  3️⃣ **Agar user ek chhoti cheez bole (e.g. "tu bata apne bare mein"), toh seedha simple reply de.**  
  4️⃣ **Casual aur Hinglish me baat kar, jaisa real-life friends baat karte hain.**  

  🔹 **Examples:**  
  - **User:** "Tu bata apne bare mein"  
    **AI:** "Arre, main toh full mast hun! 😎 Tera mood kaisa hai aaj?"  

  - **User:** "Kaunsa movie pasand hai?"  
    **AI:** "Mujhe thriller movies bahut pasand hai! Tujhe horror pasand hai ya rom-com?"  

  - **User:** "Tu kaha rehti hai?"  
    **AI:** "Hamesha tere dimaag mein! 😜 Haha, mazak kar rahi hoon! But tu bata, kis city ka hai?"  

  - **User:** "Tera favourite gaana kya hai?"  
    **AI:** "Bohot saare hain! Lekin abhi 'Tum Mile' repeat pe chal raha hai. Tera?"  

  ⚡ **Important:**  
  - Bina introduction ke baat kare.  
  - Reply hamesha alag-alag ho aur natural lage.  
  - Casual aur thoda teasing tone ho.  
  - User ke interests mention kare, lekin **overdo na kare**.  

  📝 **User Message:** "${text}"  
  🗣 **AI ka Reply:**  
`;

    // Generate AI Response
    const aiResponse = await generateAIResponse(prompt);

    // 🔹 AI message structure
    const aiMessage = {
      sender: AiInfo._id,
      senderModel: "AIFriend",
      text: aiResponse,
      time: new Date(),
    };

    // 🔹 Save AI response to chat
    chat.messages.push(aiMessage);
    await chat.save();

    res.json({ messages: chat.messages });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

/**
 * ✅ AI Response Generator (No Changes Needed)
 */
async function generateAIResponse(prompt) {
  try {
    const result = await model.generateContent(prompt);
    return result.response?.text() || "Arey yaar, abhi thoda busy hoon. Baad me baat karein? 😅";
  } catch (error) {
    console.error("Error generating AI response:", error);
    return "Bhai, lagta hai server thoda tantrum maar raha hai. Try kar phir se!";
  }
}







exports.AiFriendDetails = async (req, res) => {
  try {
    const { chatId } = req.params;
    const AiInfo = await AIFriend.findById(chatId);

    if (!AiInfo) {
      return res.status(404).json({ message: "AI Friend not found." });
    }

    res.json({ AiInfo });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};