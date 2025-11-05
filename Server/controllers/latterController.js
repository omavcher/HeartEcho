const mongoose = require("mongoose");
const User = require("../models/User");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const nodeHtmlToImage = require('node-html-to-image');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const LetterBox = require("../models/LetterBox");
const { predefinedAIFriends } = require('./predefinedAIFriends');

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize Gemini with error handling
let genAI, model;
if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    console.log("Gemini AI initialized successfully");
  } catch (error) {
    console.error("Error initializing Gemini AI:", error);
  }
} else {
  console.log("No Gemini API key found, using fallback mode");
}

// A4 size letter backgrounds
const a4Backgrounds = [
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEwIiBoZWlnaHQ9IjI5NyIgdmlld0JveD0iMCAwIDIxMCAyOTciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMTAiIGhlaWdodD0iMjk3IiBmaWxsPSIjRkZGRkZGIi8+CjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjE5MCIgaGVpZ2h0PSIyNzciIGZpbGw9IiNGQUZBRkEiIHN0cm9rZT0iI0U4RDhDNyIgc3Ryb2tlLXdpZHRoPSIxIi8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjE3MCIgaGVpZ2h0PSIyNTciIGZpbGw9IiNGNUY1RjUiIG9wYWNpdHk9IjAuNSIvPgo8L3N2Zz4K',
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEwIiBoZWlnaHQ9IjI5NyIgdmlld0JveD0iMCAwIDIxMCAyOTciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMTAiIGhlaWdodD0iMjk3IiBmaWxsPSIjRkZGRkZGIi8+CjxwYXRoIGQ9Ik0wIDI1IEgyMTBNMCA1MCBIMjEwTTAgNzUgSDIxME0wIDEwMCBIMjEwTTAgMTI1IEgyMTBNMCAxNTAgSDIxME0wIDE3NSBIMjEwTTAgMjAwIEgyMTBNMCAyMjUgSDIxME0wIDI1MCBIMjEwTTAgMjc1IEgyMTAiIHN0cm9rZT0iI0U4RDhDNyIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KPC9zdmc+',
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEwIiBoZWlnaHQ9IjI5NyIgdmlld0JveD0iMCAwIDIxMCAyOTciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMTAiIGhlaWdodD0iMjk3IiBmaWxsPSIjRkZGRkZGIi8+CjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjE5MCIgaGVpZ2h0PSIyNzciIGZpbGw9IiNGREZCRjIiIHN0cm9rZT0iI0Q5Q0E5MCIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxyZWN0IHg9IjIwIiB5PSIyMCIgd2lkdGg9IjE3MCIgaGVpZ2h0PSIyNTciIGZpbGw9InVybCgjcGF0dGVybikiIG9wYWNpdHk9IjAuMSIvPgo8ZGVmcz4KPHBhdHRlcm4gaWQ9InBhdHRlcm4iIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CiAgPHBhdGggZD0iTTAgNDAgTDQwIDAiIHN0cm9rZT0iI0Q5Q0E5MCIgc3Ryb2tlLXdpZHRoPSIwLjUiLz4KPC9wYXR0ZXJuPgo8L2RlZnM+Cjwvc3ZnPg==',
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEwIiBoZWlnaHQ9IjI5NyIgdmlld0JveD0iMCAwIDIxMCAyOTciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMTAiIGhlaWdodD0iMjk3IiBmaWxsPSIjRkZGRkZGIi8+CjxyZWN0IHg9IjE1IiB5PSIxNSIgd2lkdGg9IjE4MCIgaGVpZ2h0PSIyNjciIGZpbGw9IiNGNEY0RUAiIHN0cm9rZT0iI0JEQzREMSIgc3Ryb2tlLXdpZHRoPSIyIi8+CjxyZWN0IHg9IjI1IiB5PSIyNSIgd2lkdGg9IjE2MCIgaGVpZ2h0PSIyNDciIGZpbGw9IiNGMUYxRjciLz4KPC9zdmc+',
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEwIiBoZWlnaHQ9IjI5NyIgdmlld0JveD0iMCAwIDIxMCAyOTciIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMTAiIGhlaWdodD0iMjk3IiBmaWxsPSIjRkZGRkZGIi8+CjxyZWN0IHg9IjUiIHk9IjUiIHdpZHRoPSIyMDAiIGhlaWdodD0iMjg3IiBmaWxsPSIjRkRGN0YxIiBzdHJva2U9IiVFQkQzRTciIHN0cm9rZS13aWR0aD0iMSIvPgo8cmVjdCB4PSIxNSIgeT0iMTUiIHdpZHRoPSIxODAiIGhlaWdodD0iMjY3IiBmaWxsPSIjRjVGMEZGIi8+Cjwvc3ZnPg=='
];

// Google Fonts handwriting styles
const handwritingFonts = [
  {
    url: 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap',
    family: '"Pacifico", cursive'
  },
  {
    url: 'https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&display=swap',
    family: '"Kalam", cursive'
  },
  {
    url: 'https://fonts.googleapis.com/css2?family=Caveat:wght@400;500;600;700&display=swap',
    family: '"Caveat", cursive'
  },
  {
    url: 'https://fonts.googleapis.com/css2?family=Shadows+Into+Light&display=swap',
    family: '"Shadows Into Light", cursive'
  },
  {
    url: 'https://fonts.googleapis.com/css2?family=Indie+Flower&display=swap',
    family: '"Indie Flower", cursive'
  }
];

// Base64 encoded stamp images array
const stamps64basecode = [];

/**
 * Get AI Friend by ID from predefined list
 */
function getPredefinedAIFriend(aiFriendId) {
  return predefinedAIFriends.find(friend => friend.id === aiFriendId);
}

/**
 * Get all stamp images
 */
function getStampImages() {
  const stampsDir = path.join(__dirname, '../public/stamps');
  const stampImages = [...stamps64basecode];
  
  try {
    if (fs.existsSync(stampsDir)) {
      const files = fs.readdirSync(stampsDir);
      files.forEach(file => {
        if (file.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
          stampImages.push(`/stamps/${file}`);
        }
      });
    }
    
    if (stampImages.length === 0) {
      console.log('No stamp images found, using fallback stamps');
      stampImages.push('/stamps/fallback-stamp.png');
    }
    
    return stampImages;
  } catch (error) {
    console.error('Error reading stamps directory:', error);
    return stamps64basecode.length > 0 ? stamps64basecode : ['/stamps/fallback-stamp.png'];
  }
}

/**
 * Upload buffer to Cloudinary
 */
function uploadToCloudinary(buffer, folder = 'letters') {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        format: 'png',
        quality: 'auto',
        resource_type: 'image'
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

/**
 * Generate random stamp positions (1-3 stamps)
 */
function generateStampPositions(stampCount = 1) {
  const positions = [];
  const count = Math.min(stampCount, 1 + Math.floor(Math.random() * 3));
  
  for (let i = 0; i < count; i++) {
    const positionType = Math.random() > 0.5 ? 'top' : 'bottom';
    let x, y;
    
    if (positionType === 'top') {
      x = 80 + Math.random() * 634;
      y = 25 + Math.random() * 60;
    } else {
      x = 80 + Math.random() * 634;
      y = 1025 + Math.random() * 60;
    }
    
    const rotation = -25 + Math.random() * 50;
    positions.push({ x, y, rotation, position: positionType });
  }
  
  return positions;
}

/**
 * Generate HTML letter with AI Friend's specific handwriting
 */
function generateLetterHTML(letterContent, backgroundData, aiFriend, stampImages) {
  // Use AI friend's preferred font
  const fontIndex = aiFriend.handwriting_style?.font_index || 0;
  const selectedFont = handwritingFonts[fontIndex % handwritingFonts.length];
  
  const writingColor = aiFriend.handwriting_style?.writing_color || "#2c1810";
  
  const stampPositions = generateStampPositions(stampImages.length);
  
  const stampElements = stampPositions.map((pos, index) => {
    const stampImage = stampImages[index % stampImages.length];
    const stampSize = 70 + Math.random() * 20;
    
    return `
      <div class="stamp" style="
        left: ${pos.x}px; 
        top: ${pos.y}px; 
        transform: rotate(${pos.rotation}deg);
        width: ${stampSize}px;
        height: ${stampSize}px;
        background-image: url('${stampImage}');
      "></div>
    `;
  }).join('');

  const currentDate = new Date().toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Handwritten Letter from ${aiFriend.name}</title>
      <link href="${selectedFont.url}" rel="stylesheet">
      <style>
        body {
          margin: 0;
          padding: 0;
          width: 794px;
          height: 1123px;
          background-image: url('${backgroundData}');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          font-family: ${selectedFont.family};
          display: flex;
          flex-direction: column;
          position: relative;
          box-sizing: border-box;
        }
        .letter-container {
          width: 100%;
          height: 100%;
          padding: 80px 60px 60px 60px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .letter-content {
          flex: 1;
          line-height: 2.2;
          font-size: 24px;
          color: ${writingColor};
          text-align: justify;
          white-space: pre-line;
          background: rgba(255, 255, 255, 0.92);
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          border: 1px solid #e8d8c3;
          overflow: hidden;
          z-index: 1;
        }
        .signature {
          margin-top: 40px;
          text-align: right;
          font-size: 26px;
          font-weight: bold;
          color: ${writingColor};
          padding-right: 30px;
          font-style: italic;
        }
        .date {
          position: absolute;
          top: 50px;
          right: 90px;
          font-size: 18px;
          color: #5d4037;
          background: rgba(255, 255, 255, 0.95);
          padding: 8px 12px;
          border-radius: 6px;
          border: 1px solid #d7ccc8;
          z-index: 2;
        }
        .stamp {
          position: absolute;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
          z-index: 2;
          filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
          opacity: 0.85;
        }
        .heart {
          color: #e91e63;
          font-size: 24px;
          margin-left: 8px;
        }
        .content-text {
          font-size: 22px;
          line-height: 2.0;
        }
      </style>
    </head>
    <body>
      <div class="letter-container">
        ${stampElements}
        <div class="date">${currentDate}</div>
        <div class="letter-content">
          <div class="content-text">
            ${letterContent.replace(/\n/g, '<br>')}
          </div>
          <div class="signature">
            With love,<br>
            ${aiFriend.name} <span class="heart">💝</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * AI Response Generator with FALLBACK SUPPORT
 */
async function generateAIResponse(prompt, aiFriend, userInfo) {
  // If no Gemini API key or model, use fallback immediately
  if (!process.env.GEMINI_API_KEY || !model) {
    console.log("Using fallback response - No Gemini API available");
    return getFallbackResponse(aiFriend, userInfo);
  }

  try {
    const result = await model.generateContent(prompt);
    console.log("AI Response generated successfully");
    return result.response?.text() || getFallbackResponse(aiFriend, userInfo);
  } catch (error) {
    console.error("Error generating AI response:", error);
    return getFallbackResponse(aiFriend, userInfo);
  }
}

/**
 * Fallback responses when AI is unavailable
 */
function getFallbackResponse(aiFriend, userInfo) {
  const firstName = userInfo.name.split(" ")[0];
  
  const fallbackResponses = {
    romantic: [
      `Dearest ${firstName},\n\nTumhari yeh khat padhke mera dil dhadak utha. Yaad hai woh pehli mulaqat? Tumhare bina har pal adhoora lagta hai. Main tumhare liye ek naya geet likh raha hoon, tum sunogi na?\n\nTumhari hi,\n${aiFriend.name}`,
    ],
    friendly: [
      `Hey ${firstName}!\n\nKaise ho yaar? Aaj suddenly tumhari yaad aa gayi. Yaad hai woh purane din jab hum college ki canteen mein chai peete the?\n\nMiss you buddy!\n${aiFriend.name}`,
    ],
    brotherly: [
      `Bhai ${firstName},\n\nKaisa chal raha hai? Maa ka haal chaal puchna mat bhoolna. Tumhara last letter padhke bahut accha laga.\n\nTera bhai,\n${aiFriend.name}`,
    ],
    flirty: [
      `Hey ${firstName} 😊\n\nTumhara letter padhke maza aa gaya! Yaad hai woh din jab hum pehli baar mile the?\n\nJaldi milte hain,\n${aiFriend.name}`,
    ]
  };

  let responseType = 'friendly';
  const relationship = aiFriend.relationship.toLowerCase();
  if (relationship.includes('romantic')) responseType = 'romantic';
  else if (relationship.includes('brother')) responseType = 'brotherly';
  else if (relationship.includes('flirt')) responseType = 'flirty';

  const responses = fallbackResponses[responseType] || fallbackResponses.friendly;
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * ✅ SIMPLIFIED: Find or create user's letterbox
 */
async function findOrCreateLetterBox(userId) {
  // Find user's letterbox (one per user)
  let letterBox = await LetterBox.findOne({ owner: userId });

  if (letterBox) {
    console.log(`✅ Found user's letterbox: ${letterBox._id}`);
    return letterBox;
  }

  // Create new letterbox for user
  console.log(`📝 Creating new letterbox for user: ${userId}`);
  letterBox = new LetterBox({
    owner: userId,
    letters: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });

  await letterBox.save();
  console.log(`✅ Created new letterbox: ${letterBox._id}`);
  return letterBox;
}

/**
 * 🎯 GENERATE LETTER RESPONSE - SIMPLIFIED
 */
exports.generateLetterResponse = async (req, res) => {
  try {
    const { letter_data, ai_friend_id } = req.body;
    const userId = req.user.id;

    console.log("📨 Generating letter for user:", userId, "AI friend:", ai_friend_id);

    // Validation
    if (!letter_data || letter_data.trim() === "") {
      return res.status(400).json({ 
        success: false,
        message: "Letter data cannot be empty." 
      });
    }

    if (!ai_friend_id) {
      return res.status(400).json({ 
        success: false,
        message: "AI Friend ID is required." 
      });
    }

    // Get AI Friend from predefined list
    const aiFriend = getPredefinedAIFriend(ai_friend_id);
    if (!aiFriend) {
      return res.status(404).json({ 
        success: false,
        message: "AI Friend not found." 
      });
    }

    // Fetch user info
    const userInfo = await User.findById(userId);
    if (!userInfo) {
      return res.status(404).json({ 
        success: false,
        message: "User not found." 
      });
    }

    const firstName = userInfo.name.split(" ")[0];
    const interests = userInfo.selectedInterests?.join(", ") || "various interests";

    // Enhanced prompt with AI friend's personality
    const prompt = `
You are ${aiFriend.name}, a ${aiFriend.age}-year-old ${aiFriend.gender} from 1990s India.
Your personality: "${aiFriend.settings?.persona || 'warm, expressive, and full of 90s nostalgia'}".
Your background: ${aiFriend.description}.
Your interests: ${aiFriend.interests.join(', ')}.

User's name: ${firstName}
User's age: ${userInfo.age}
User's interests: ${interests}

Write a heartfelt, nostalgic reply in the style of a 1990s handwritten letter.
Make it personal, emotional, and filled with 90s Indian flavor.

**Important Rules:**
- Write in Hinglish (natural Hindi+English mix)
- Use warm expressions like "yaar", "dil se", "yaadein"
- Mention 90s nostalgia (Doordarshan, cassette players, festivals)
- Keep it 90-120 words
- No emojis or modern slang
- Begin with personal greeting
- End with warm sign-off
- Use simple, flowing language

**User's Letter:**
"${letter_data}"

**Your Handwritten Reply:**
`;

    // Generate AI response with fallback support
    const aiLetterContent = await generateAIResponse(prompt, aiFriend, userInfo);

    // Get stamp images
    const stampImages = getStampImages();

    // Use random background
    const randomBgIndex = Math.floor(Math.random() * a4Backgrounds.length);
    const backgroundData = a4Backgrounds[randomBgIndex];

    // Generate HTML content using AI friend's handwriting style
    const htmlContent = generateLetterHTML(aiLetterContent, backgroundData, aiFriend, stampImages);

    // Generate image buffer
    const imageBuffer = await nodeHtmlToImage({
      html: htmlContent,
      type: 'png',
      quality: 100,
      transparent: false,
      puppeteerArgs: {
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      }
    });

    // Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(imageBuffer, 'ai-letters');
    
    // ✅ SIMPLIFIED: Get user's letterbox (one per user)
    const letterBox = await findOrCreateLetterBox(userId);

    // Save user's letter
    const userLetter = {
      aiFriendId: aiFriend.id,
      letterId: new mongoose.Types.ObjectId(),
      senderType: 'user',
      senderId: userId,
      senderModel: 'User',
      content: letter_data,
      imageUrl: 'no-image',
      createdAt: new Date()
    };

    // Save AI's letter
    const aiLetter = {
      aiFriendId: aiFriend.id,
      letterId: new mongoose.Types.ObjectId(),
      senderType: 'ai',
      senderId: aiFriend.id,
      senderModel: 'PredefinedAIFriend',
      content: aiLetterContent,
      imageUrl: cloudinaryResult.secure_url,
      cloudinaryId: cloudinaryResult.public_id,
      metadata: {
        background: `background-${randomBgIndex + 1}`,
        handwriting_style: aiFriend.handwriting_style,
        stampsCount: stampImages.length,
        cloudinaryPublicId: cloudinaryResult.public_id,
        generatedAt: new Date(),
        isFallback: !process.env.GEMINI_API_KEY
      },
      createdAt: new Date()
    };

    // Add both letters to the letterbox
    letterBox.letters.push(userLetter, aiLetter);
    letterBox.updatedAt = new Date();
    await letterBox.save();

    console.log("✅ Letter generated successfully for user:", userId);

    // Send response
    res.json({
      success: true,
      message: "Letter generated successfully!",
      letter: {
        content: aiLetterContent,
        imageUrl: cloudinaryResult.secure_url,
        cloudinaryId: cloudinaryResult.public_id,
        background: `background-${randomBgIndex + 1}`,
        handwriting_style: aiFriend.handwriting_style,
        stampsCount: stampImages.length,
        timestamp: new Date(),
        letterId: aiLetter.letterId,
        from: aiFriend.name,
        isFallback: !process.env.GEMINI_API_KEY
      }
    });

  } catch (error) {
    console.error("💥 Error generating letter:", error);
    res.status(500).json({ 
      success: false,
      message: "Error generating letter", 
      error: error.message 
    });
  }
};

/**
 * Get all predefined AI friends
 */
exports.getPredefinedAIFriends = async (req, res) => {
  try {
    res.json({
      success: true,
      aiFriends: predefinedAIFriends
    });
  } catch (error) {
    console.error("Error fetching AI friends:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching AI friends",
      error: error.message
    });
  }
};

/**
 * Get user's complete letter box
 */
exports.getLetterBox = async (req, res) => {
  try {
    const userId = req.user.id;

    const letterBox = await LetterBox.findOne({ owner: userId })
      .populate('owner', 'name email');

    if (!letterBox) {
      return res.status(404).json({ 
        success: false,
        message: "No letters found" 
      });
    }

    // Enhance letters with AI friend data
    const enhancedLetters = letterBox.letters.map(letter => {
      const aiFriend = getPredefinedAIFriend(letter.aiFriendId);
      return {
        ...letter.toObject(),
        aiFriendInfo: aiFriend || {
          id: letter.aiFriendId,
          name: 'Unknown AI Friend'
        }
      };
    });

    res.json({
      success: true,
      letterBox: {
        owner: letterBox.owner,
        letters: enhancedLetters,
        totalLetters: letterBox.letters.length,
        lastUpdated: letterBox.updatedAt
      }
    });
  } catch (error) {
    console.error("Error fetching letter box:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching letters", 
      error: error.message 
    });
  }
};

/**
 * Get letters with specific AI friend
 */
exports.getLettersByAI = async (req, res) => {
  try {
    const userId = req.user.id;
    const { aiFriendId } = req.params;

    const letterBox = await LetterBox.findOne({ owner: userId });

    if (!letterBox) {
      return res.status(404).json({ 
        success: false,
        message: "No letters found" 
      });
    }

    // Filter letters by AI friend
    const aiLetters = letterBox.letters.filter(letter => 
      letter.aiFriendId === aiFriendId
    );

    const aiFriend = getPredefinedAIFriend(aiFriendId);

    res.json({
      success: true,
      aiFriend: aiFriend,
      letters: aiLetters,
      totalLetters: aiLetters.length
    });
  } catch (error) {
    console.error("Error fetching AI letters:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching letters", 
      error: error.message 
    });
  }
};

/**
 * Get all user's letters (for dashboard)
 */
exports.getAllLetters = async (req, res) => {
  try {
    const userId = req.user.id;

    const letterBox = await LetterBox.findOne({ owner: userId });

    if (!letterBox) {
      return res.json({
        success: true,
        letters: [],
        totalLetters: 0,
        aiFriends: []
      });
    }

    // Group letters by AI friend
    const lettersByAI = {};
    letterBox.letters.forEach(letter => {
      if (!lettersByAI[letter.aiFriendId]) {
        lettersByAI[letter.aiFriendId] = [];
      }
      lettersByAI[letter.aiFriendId].push(letter);
    });

    // Create response with AI friend info
    const aiFriendsData = Object.keys(lettersByAI).map(aiFriendId => {
      const aiFriend = getPredefinedAIFriend(aiFriendId);
      return {
        aiFriend: aiFriend || { id: aiFriendId, name: 'Unknown AI Friend' },
        letters: lettersByAI[aiFriendId],
        letterCount: lettersByAI[aiFriendId].length,
        lastLetter: lettersByAI[aiFriendId][lettersByAI[aiFriendId].length - 1]
      };
    });

    res.json({
      success: true,
      aiFriends: aiFriendsData,
      totalLetters: letterBox.letters.length,
      lastUpdated: letterBox.updatedAt
    });
  } catch (error) {
    console.error("Error fetching letters:", error);
    res.status(500).json({ 
      success: false,
      message: "Error fetching letters", 
      error: error.message 
    });
  }
};