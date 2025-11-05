const mongoose = require("mongoose");
const User = require("../models/User");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { createCanvas, loadImage, registerFont } = require('canvas');
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

// A4 size letter backgrounds (SVG data URLs)
const a4Backgrounds = [
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzk0IiBoZWlnaHQ9IjExMjMiIHZpZXdCb3g9IjAgMCA3OTQgMTEyMyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijc5NCIgaGVpZ2h0PSIxMTIzIiBmaWxsPSIjRkZGRkZGIi8+CjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9Ijc3NCIgaGVpZ2h0PSIxMTAzIiBmaWxsPSIjRkFGQUZBIiBzdHJva2U9IiNFOEQ4QzciIHN0cm9rZS13aWR0aD0iMSIvPgo8cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSI3NTQiIGhlaWdodD0iMTA4MyIgZmlsbD0iI0Y1RjVGNSIgb3BhY2l0eT0iMC41Ii8+Cjwvc3ZnPgo=',
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzk0IiBoZWlnaHQ9IjExMjMiIHZpZXdCb3g9IjAgMCA3OTQgMTEyMyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijc5NCIgaGVpZ2h0PSIxMTIzIiBmaWxsPSIjRkZGRkZGIi8+CjxwYXRoIGQ9Ik0wIDI1IEg3OTRNMCA1MCBINzk0TTAgNzUgSDc5NE0wIDEwMCBINzk0TTAgMTI1IEg3OTRNMCAxNTAgSDc5NE0wIDE3NSBINzk0TTAgMjAwIEg3OTRNMCAyMjUgSDc5NE0wIDI1MCBINzk0TTAgMjc1IEg3OTRNMCAzMDAgSDc5NE0wIDMyNSBINzk0TTAgMzUwIEg3OTRNMCAzNzUgSDc5NE0wIDQwMCBINzk0TTAgNDI1IEg3OTRNMCA0NTAgSDc5NE0wIDQ3NSBINzk0TTAgNTAwIEg3OTRNMCA1MjUgSDc5NE0wIDU1MCBINzk0TTAgNTc1IEg3OTRNMCA2MDAgSDc5NE0wIDYyNSBINzk0TTAgNjUwIEg3OTRNMCA2NzUgSDc5NE0wIDcwMCBINzk0TTAgNzI1IEg3OTRNMCA3NTAgSDc5NE0wIDc3NSBINzk0TTAgODAwIEg3OTRNMCA4MjUgSDc5NE0wIDg1MCBINzk0TTAgODc1IEg3OTRNMCA5MDAgSDc5NE0wIDkyNSBINzk0TTAgOTUwIEg3OTRNMCA5NzUgSDc5NE0wIDEwMDAgSDc5NE0wIDEwMjUgSDc5NE0wIDEwNTAgSDc5NE0wIDEwNzUgSDc5NE0wIDExMDAgSDc5NCIgc3Ryb2tlPSIjRThEOEM3IiBzdHJva2Utd2lkdGg9IjAuNSIvPgo8L3N2Zz4K',
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzk0IiBoZWlnaHQ9IjExMjMiIHZpZXdCb3g9IjAgMCA3OTQgMTEyMyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijc5NCIgaGVpZ2h0PSIxMTIzIiBmaWxsPSIjRkZGRkZGIi8+CjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9Ijc3NCIgaGVpZ2h0PSIxMTAzIiBmaWxsPSIjRkRGQkYyIiBzdHJva2U9IiNEOUNBOTAiIHN0cm9rZS13aWR0aD0iMiIvPgo8cmVjdCB4PSIyMCIgeT0iMjAiIHdpZHRoPSI3NTQiIGhlaWdodD0iMTA4MyIgZmlsbD0idXJsKCNwYXR0ZXJuKSIgb3BhY2l0eT0iMC4xIi8+CjxkZWZzPgo8cGF0dGVybiBpZD0icGF0dGVybiIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIj4KICA8cGF0aCBkPSJNMCA0MCBMNDAgMCIgc3Ryb2tlPSIjRDlDQTkwIiBzdHJva2Utd2lkdGg9IjAuNSIvPgo8L3BhdHRlcm4+CjwvZGVmcz4KPC9zdmc+Cg==',
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzk0IiBoZWlnaHQ9IjExMjMiIHZpZXdCb3g9IjAgMCA3OTQgMTEyMyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijc5NCIgaGVpZ2h0PSIxMTIzIiBmaWxsPSIjRkZGRkZGIi8+CjxyZWN0IHg9IjE1IiB5PSIxNSIgd2lkdGg9Ijc2NCIgaGVpZ2h0PSIxMDkzIiBmaWxsPSIjRjRGNEVBIiBzdHJva2U9IiNCRUM0RDEiIHN0cm9rZS13aWR0aD0iMiIvPgo8cmVjdCB4PSIyNSIgeT0iMjUiIHdpZHRoPSI3NDQiIGhlaWdodD0iMTA3MyIgZmlsbD0iI0YxRjFGNyIvPgo8L3N2Zz4K',
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzk0IiBoZWlnaHQ9IjExMjMiIHZpZXdCb3g9IjAgMCA3OTQgMTEyMyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijc5NCIgaGVpZ2h0PSIxMTIzIiBmaWxsPSIjRkZGRkZGIi8+CjxyZWN0IHg9IjUiIHk9IjUiIHdpZHRoPSI3ODQiIGhlaWdodD0iMTEzIiBmaWxsPSIjRkRGN0YxIiBzdHJva2U9IiNFQkQzRTciIHN0cm9rZS13aWR0aD0iMSIvPgo8cmVjdCB4PSIxNSIgeT0iMTUiIHdpZHRoPSI3NjQiIGhlaWdodD0iMTA5MyIgZmlsbD0iI0Y1RjBGRiIvPgo8L3N2Zz4K'
];

// Handwriting font configurations
const handwritingFonts = [
  { name: 'Pacifico', family: '"Pacifico", cursive', size: 22 },
  { name: 'Kalam', family: '"Kalam", cursive', size: 20 },
  { name: 'Caveat', family: '"Caveat", cursive', size: 24 },
  { name: 'Shadows Into Light', family: '"Shadows Into Light", cursive', size: 22 },
  { name: 'Indie Flower', family: '"Indie Flower", cursive', size: 21 }
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
          const filePath = path.join(stampsDir, file);
          const imageBuffer = fs.readFileSync(filePath);
          const base64Image = `data:image/${path.extname(file).slice(1)};base64,${imageBuffer.toString('base64')}`;
          stampImages.push(base64Image);
        }
      });
    }
    
    if (stampImages.length === 0) {
      console.log('No stamp images found, using fallback stamps');
      // Create a simple fallback stamp
      const fallbackStamp = 'data:image/svg+xml;base64,' + Buffer.from(`
        <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e74c3c" stroke-width="3" stroke-dasharray="5,5"/>
          <text x="50" y="55" text-anchor="middle" font-family="Arial" font-size="12" fill="#e74c3c">STAMP</text>
        </svg>
      `).toString('base64');
      stampImages.push(fallbackStamp);
    }
    
    return stampImages;
  } catch (error) {
    console.error('Error reading stamps directory:', error);
    return stamps64basecode.length > 0 ? stamps64basecode : ['data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDUiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2U3NGMzYyIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtZGFzaGFycmF5PSI1LDUiLz48dGV4dCB4PSI1MCIgeT0iNTUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iI2U3NGMzYyI+U1RBTVA8L3RleHQ+PC9zdmc+'];
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
        quality: 'auto:good',
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
 * Wrap text to fit within canvas width
 */
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const width = ctx.measureText(currentLine + " " + word).width;
    if (width < maxWidth) {
      currentLine += " " + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

/**
 * Generate letter image using Canvas
 */
async function generateLetterImage(letterContent, backgroundData, aiFriend, stampImages) {
  // Create canvas
  const canvas = createCanvas(794, 1123); // A4 size at 96 DPI
  const ctx = canvas.getContext('2d');

  try {
    // Load and draw background
    const background = await loadImage(backgroundData);
    ctx.drawImage(background, 0, 0, 794, 1123);

    // Draw letter container with shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4;
    
    // Letter content area
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.fillRect(60, 80, 674, 923);
    
    // Border
    ctx.strokeStyle = '#e8d8c3';
    ctx.lineWidth = 1;
    ctx.strokeRect(60, 80, 674, 923);
    
    // Reset shadow
    ctx.shadowColor = 'transparent';

    // Use AI friend's preferred font
    const fontIndex = aiFriend.handwriting_style?.font_index || 0;
    const selectedFont = handwritingFonts[fontIndex % handwritingFonts.length];
    const writingColor = aiFriend.handwriting_style?.writing_color || "#2c1810";
    
    // Set font and text properties
    ctx.fillStyle = writingColor;
    ctx.font = `${selectedFont.size}px ${selectedFont.family}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Draw letter content with word wrapping
    const maxWidth = 614; // 674 - 60 padding
    const lineHeight = selectedFont.size * 1.6;
    let y = 140;
    
    const paragraphs = letterContent.split('\n');
    
    for (const paragraph of paragraphs) {
      if (paragraph.trim() === '') {
        y += lineHeight * 0.5; // Add space between paragraphs
        continue;
      }
      
      const lines = wrapText(ctx, paragraph, maxWidth);
      
      for (const line of lines) {
        if (y > 900) break; // Don't overflow content area
        
        // Add slight randomness to make it look handwritten
        const randomOffsetX = Math.random() * 2 - 1;
        const randomOffsetY = Math.random() * 2 - 1;
        
        ctx.fillText(line, 90 + randomOffsetX, y + randomOffsetY);
        y += lineHeight;
      }
      
      y += lineHeight * 0.3; // Space between paragraphs
    }

    // Draw signature
    ctx.font = `bold ${selectedFont.size + 4}px ${selectedFont.family}`;
    ctx.textAlign = 'right';
    ctx.fillText('With love,', 650, 950);
    ctx.fillText(`${aiFriend.name} 💝`, 650, 950 + lineHeight);

    // Draw date
    const currentDate = new Date().toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
    
    ctx.font = '18px Arial';
    ctx.fillStyle = '#5d4037';
    ctx.textAlign = 'right';
    ctx.fillText(currentDate, 700, 100);

    // Draw stamps
    const stampPositions = generateStampPositions(stampImages.length);
    
    for (let i = 0; i < stampPositions.length; i++) {
      const pos = stampPositions[i];
      const stampImage = await loadImage(stampImages[i % stampImages.length]);
      const stampSize = 70 + Math.random() * 20;
      
      ctx.save();
      ctx.translate(pos.x, pos.y);
      ctx.rotate(pos.rotation * Math.PI / 180);
      
      // Add stamp shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      ctx.drawImage(stampImage, -stampSize/2, -stampSize/2, stampSize, stampSize);
      
      ctx.restore();
    }

    console.log("✅ Canvas image generated successfully");
    return canvas.toBuffer('image/png');

  } catch (error) {
    console.error("❌ Error generating canvas image:", error);
    
    // Fallback: Create a simple image
    return generateFallbackImage(letterContent, aiFriend);
  }
}

/**
 * Generate fallback image if canvas fails
 */
async function generateFallbackImage(letterContent, aiFriend) {
  const canvas = createCanvas(794, 1123);
  const ctx = canvas.getContext('2d');
  
  // Simple background
  ctx.fillStyle = '#fafafa';
  ctx.fillRect(0, 0, 794, 1123);
  
  // Border
  ctx.strokeStyle = '#e8d8c3';
  ctx.lineWidth = 2;
  ctx.strokeRect(50, 50, 694, 1023);
  
  // Text content
  ctx.fillStyle = '#2c1810';
  ctx.font = '20px Arial';
  ctx.textAlign = 'left';
  
  const lines = letterContent.split('\n').slice(0, 20); // Limit lines
  let y = 100;
  
  for (const line of lines) {
    if (line.trim()) {
      ctx.fillText(line.substring(0, 80), 80, y); // Limit line length
      y += 30;
    }
  }
  
  // Signature
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'right';
  ctx.fillText('With love,', 700, 1000);
  ctx.fillText(aiFriend.name, 700, 1030);
  
  return canvas.toBuffer('image/png');
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

    console.log("🖼️ Generating image with Canvas...");

    // Generate image buffer using Canvas
    const imageBuffer = await generateLetterImage(aiLetterContent, backgroundData, aiFriend, stampImages);

    console.log("✅ Image generated successfully, uploading to Cloudinary...");

    // Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(imageBuffer, 'ai-letters');
    
    console.log("☁️ Image uploaded to Cloudinary:", cloudinaryResult.secure_url);

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