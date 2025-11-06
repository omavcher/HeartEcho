const mongoose = require("mongoose");
const User = require("../models/User");
const { GoogleGenerativeAI } = require("@google/generative-ai");
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
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNzk0IiBoZWlnaHQ9IjExMjMiIHZpZXdCb3g9IjAgMCA3OTQgMTEyMyIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9Ijc5NCIgaGVpZ2h0PSIxMTIzIiBmaWxsPSIjRkZGRkZGIi8+CjxyZWN0IHg9IjUiIHk9IjUiIHdpZHRoPSI3ODQiIGhlaWdodD0iMTEzIiBmaWxsPSIjRkRGN0YxIiBzdHJva2U9IiVFQkQzRTciIHN0cm9rZS13aWR0aD0iMSIvPgo8cmVjdCB4PSIxNSIgeT0iMTUiIHdpZHRoPSI3NjQiIGhlaWdodD0iMTA5MyIgZmlsbD0iI0Y1RjBGRiIvPgo8L3N2Zz4K'
];

// Handwriting font configurations
const handwritingFonts = [
  { name: 'Pacifico', family: 'cursive', size: 22 },
  { name: 'Kalam', family: 'cursive', size: 20 },
  { name: 'Caveat', family: 'cursive', size: 24 },
  { name: 'Shadows Into Light', family: 'cursive', size: 22 },
  { name: 'Indie Flower', family: 'cursive', size: 21 }
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
 * Wrap text to fit within SVG width
 */
function wrapText(text, maxWidth, fontSize) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];
  const avgCharWidth = fontSize * 0.6; // Approximate character width

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const lineWidth = (currentLine.length + word.length + 1) * avgCharWidth;
    if (lineWidth < maxWidth) {
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
 * Generate SVG letter (Pure JavaScript - No Dependencies)
 */
function generateSVGLetter(letterContent, backgroundData, aiFriend, stampImages) {
  const fontIndex = aiFriend.handwriting_style?.font_index || 0;
  const selectedFont = handwritingFonts[fontIndex % handwritingFonts.length];
  const writingColor = aiFriend.handwriting_style?.writing_color || "#2c1810";
  
  const currentDate = new Date().toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  // Generate stamps
  const stampPositions = generateStampPositions(stampImages.length);
  const stampElements = stampPositions.map((pos, index) => {
    const stampImage = stampImages[index % stampImages.length];
    const stampSize = 70 + Math.random() * 20;
    return `
      <g transform="translate(${pos.x}, ${pos.y}) rotate(${pos.rotation})">
        <image href="${stampImage}" x="-${stampSize/2}" y="-${stampSize/2}" width="${stampSize}" height="${stampSize}" opacity="0.85"/>
      </g>
    `;
  }).join('');

  // Process letter content with line wrapping
  const paragraphs = letterContent.split('\n');
  let textContent = '';
  let currentY = 140;
  const lineHeight = selectedFont.size * 1.6;
  const maxWidth = 614;

  for (const paragraph of paragraphs) {
    if (paragraph.trim() === '') {
      currentY += lineHeight * 0.5;
      continue;
    }
    
    const lines = wrapText(paragraph, maxWidth, selectedFont.size);
    
    for (const line of lines) {
      if (currentY > 900) break;
      
      // Add slight randomness to make it look handwritten
      const randomOffsetX = (Math.random() * 4 - 2).toFixed(1);
      const randomOffsetY = (Math.random() * 4 - 2).toFixed(1);
      
      textContent += `
        <text x="${90 + parseFloat(randomOffsetX)}" y="${currentY + parseFloat(randomOffsetY)}" 
              font-family="${selectedFont.family}" font-size="${selectedFont.size}" 
              fill="${writingColor}" text-anchor="start">
          ${line.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
        </text>
      `;
      currentY += lineHeight;
    }
    
    currentY += lineHeight * 0.3;
  }

  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="794" height="1123" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <!-- Background -->
  <rect width="100%" height="100%" fill="#fafafa"/>
  
  <!-- Paper Texture -->
  <rect x="20" y="20" width="754" height="1083" fill="#f5f5f5" stroke="#e8d8c7" stroke-width="1"/>
  
  <!-- Letter Content Area with Shadow -->
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="4" dy="4" stdDeviation="8" flood-color="rgba(0,0,0,0.15)"/>
    </filter>
  </defs>
  
  <rect x="60" y="80" width="674" height="923" fill="rgba(255,255,255,0.95)" stroke="#e8d8c3" stroke-width="1" filter="url(#shadow)"/>
  
  <!-- Stamps -->
  ${stampElements}
  
  <!-- Date -->
  <text x="700" y="100" text-anchor="end" font-family="Arial" font-size="18" fill="#5d4037">
    ${currentDate}
  </text>
  
  <!-- Letter Text Content -->
  ${textContent}
  
  <!-- Signature -->
  <text x="650" y="950" text-anchor="end" font-family="${selectedFont.family}" font-size="${selectedFont.size + 4}" font-weight="bold" fill="${writingColor}">
    <tspan x="650" dy="0">With love,</tspan>
    <tspan x="650" dy="35">${aiFriend.name} 💝</tspan>
  </text>
</svg>`;

  return svgContent;
}

/**
 * Generate letter image using SVG only
 */
async function generateLetterImage(letterContent, backgroundData, aiFriend, stampImages) {
  try {
    console.log("🖼️ Generating SVG letter...");
    
    // Generate SVG
    const svgContent = generateSVGLetter(letterContent, backgroundData, aiFriend, stampImages);
    
    console.log("✅ SVG image generated successfully");
    return Buffer.from(svgContent);

  } catch (error) {
    console.error("❌ Error generating SVG image:", error);
    
    // Fallback: Simple SVG
    console.log("🔄 Using SVG fallback...");
    const simpleSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="794" height="1123" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#fafafa"/>
  <rect x="50" y="50" width="694" height="1023" fill="white" stroke="#e8d8c3" stroke-width="2"/>
  <text x="100" y="100" font-family="Arial" font-size="20" fill="#2c1810">
    ${letterContent.split('\n').slice(0, 15).map((line, i) => 
      `<tspan x="100" dy="${i === 0 ? 0 : 30}">${line.substring(0, 80)}</tspan>`
    ).join('')}
  </text>
  <text x="700" y="1000" text-anchor="end" font-family="Arial" font-size="24" font-weight="bold" fill="#2c1810">
    <tspan x="700" dy="0">With love,</tspan>
    <tspan x="700" dy="30">${aiFriend.name}</tspan>
  </text>
</svg>`;
    
    return Buffer.from(simpleSVG);
  }
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

    console.log("🖼️ Generating image with pure SVG...");

    // Generate image buffer using pure SVG
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