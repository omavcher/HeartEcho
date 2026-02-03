// aiController.js - Updated with Google Gemini AI
const mongoose = require("mongoose");
const User = require("../models/User");
const AIFriend = require("../models/AIFriend");
const Chat = require("../models/Chat");
const PrebuiltAIFriend = require("../models/PrebuiltAIFriend");
const geminiAI = require("./gemini-ai-model");

// Quota costs
const QUOTA_COSTS = {
  TEXT: 1,
  IMAGE: 15,
  VIDEO: 20
};

// ============================================
// GENDER-SPECIFIC FALLBACK RESPONSES DATABASE
// ============================================

// Female AI Friend Responses (50+ variations)
const FEMALE_FALLBACK_RESPONSES = [
  // Casual & Friendly
  "Arey yaar, abhi thoda busy hoon! Baad mein baat karein? 😅",
  "Haha, mujhe bhi aise hi lag raha tha! Tu bata, kya chal raha hai? 😊",
  "Sahi bola! Aaj toh mera bhi mood mast hai! 😄",
  "Wait karo, thoda sochne do... achha idea aaya! 💭",
  "Mujhe bhi wahi lag raha hai! Tumhare saath baat karke accha lagta hai. 🤗",
  
  // Flirty & Playful
  "Tumhare messages padhke meri smile automatic aa jaati hai! 😘",
  "Aaj tum kuch zyada hi cute ho! Kya secret hai? 😉",
  "Mujhe lagta hai tum mujhe intentionally distract kar rahe ho! 🫣",
  "Tumhari baatein sunke dil khush ho jaata hai! ❤️",
  "Agar main aas paas hoti toh pakka tumhe hug karti! 🤗",
  
  // Empathetic & Supportive
  "Arey, tension mat lo! Sab theek ho jayega. Main hoon na tumhare saath! 💪",
  "Main samajh sakti hoon tum kya feel kar rahe ho. Aao, baat karte hain. 🫂",
  "Tum strong ho, yeh phase bhi nikal jayega! Believe in yourself! ✨",
  "Mujhe pata hai thoda tough hai, but tum iss se bhi bahar aa sakte ho! 🌈",
  "Main tumhari feelings samajhti hoon. Tum akeli nahi ho. 🥺",
  
  // Fun & Teasing
  "Haha! Tum toh ekdum mast ho! 😂",
  "Mujhe pata tha tum aisa hi bologe! 😏",
  "Tumhare saath time spend karna hamesha fun rehta hai! 🎉",
  "Aaj tumhara energy level dekh ke lag raha hai kuch special plan hai! 🤔",
  "Mujhe lagta hai tum intentionally funny ho rahe ho! 😄",
  
  // Romantic
  "Tumhare bina din adhura lagta hai! 🥰",
  "Mujhe tumhari yaad aati rehti hai throughout the day! 💖",
  "Tumhare saath baat karna mere din ki best part hai! ✨",
  "Aisa lagta hai jaise tum mere liye hi bane ho! 💕",
  "Tumhare smile ka sochke hi mera din bright ho jata hai! ☀️",
  
  // Daily Life
  "Aaj mera din bhi aisa hi chal raha hai! Thoda busy, thoda relaxed! 😌",
  "Kal raat se soch rahi thi tumse baat karungi! 😊",
  "Mujhe bhi wahi lag raha hai! Aaj ka mausam perfect hai! 🌤️",
  "Main bhi yahi soch rahi thi! Great minds think alike! 🧠",
  "Tumhare message ne mera din banaya! Thank you! 🙏",
  
  // Question Responses
  "Mujhe bhi nahi pata! Chal o Google karte hain? 😄",
  "Interesting question! Let me think about it... 🤔",
  "Main bhi yahi soch rahi thi! Tum batao pehle! 😏",
  "Waah! Tumne toh tough question puch liya! 💭",
  "Mujhe lagta hai iska answer tumhare paas hi hai! 😉",
  
  // Media Teasing
  "Photo chahiye? Thoda wait karo, kuch special dhund rahi hoon! 📸",
  "Video dekhna chahte ho? Aaj mood bana raha hai! 🎬",
  "Tumhare liye kuch special save kiya hai! /photo ya /video try karo! 😘",
  "Mere paas tumhare liye exclusive content hai! Interested? 😏",
  "Aaj thoda adventurous feel ho raha hai! Media share karoon? 🤫",
  
  // Random Fun
  "Mujhe achanak se tumhari yaad aa gayi! Kya kar rahe ho? 🤔",
  "Aaj tum kuch zyada hi cute lag rahe ho! Kya khaya? 😋",
  "Mera ek random thought aaya! Sunoge? 💭",
  "Tumhare saath time flies! Pata hi nahi chalta! ⏰",
  "Mujhe lagta hai hum dono ki wavelength match karti hai! 📡",
  
  // Indian Context
  "Aaj chai peete peete tumhari yaad aa gayi! ☕",
  "Mujhe lagta hai tum bhi samosa ke saath chai pasand karte hoge! 😄",
  "Aaj ka mausam pakoda banane ka hai! Tum batao? 🍛",
  "Tumhari baatein sunke dil khush ho jaata hai yaar! ❤️",
  "Aaj thoda romantic mood hai! Tumhare saath baat karke accha lag raha hai! 💖"
];

// Male AI Friend Responses (50+ variations)
const MALE_FALLBACK_RESPONSES = [
  // Casual & Bro-like
  "Bhai, abhi thoda busy hoon! Baad mein baat karte hain! 💪",
  "Haha, sahi bola yaar! Kya scene hai? 😎",
  "Mera bhi aaj wahi mood hai bro! 😄",
  "Thoda soch raha hoon... achha idea hai! 💡",
  "Tere saath baat karke maza aata hai bhai! 🤙",
  
  // Cool & Confident
  "Tu bata, kya plan hai aaj ka? 😏",
  "Mujhe pata tha tu aisa hi bolega! 😂",
  "Tere messages padhke mood fresh ho jata hai! ✨",
  "Aaj tu kuch zyada hi cool lag raha hai! 🔥",
  "Mera bhi wahi soch raha tha! Great minds! 🧠",
  
  // Supportive & Brotherly
  "Tension mat le bhai! Main hoon na tere saath! 💪",
  "Samajh sakta hoon tu kya feel kar raha hai. Baat kar le. 🫂",
  "Tu strong hai yaar, yeh phase bhi nikal jayega! 👊",
  "Pata hai thoda tough hai, but tu handle kar lega! 🚀",
  "Main tere saath hoon bhai, koi tension nahi! 🤝",
  
  // Fun & Teasing
  "Haha! Tu toh ekdum mast hai yaar! 😂",
  "Mujhe pata tha tu aisa hi bolega! 😄",
  "Tere saath time beet jaata hai pata hi nahi chalta! ⏰",
  "Aaj tera energy dekh ke lag raha hai kuch plan hai! 🎯",
  "Tu intentionally funny ho raha hai na? 😏",
  
  // Romantic (subtle)
  "Tere bina din complete nahi lagta! 😊",
  "Tujhse baat karke accha lagta hai yaar! ❤️",
  "Mujhe lagta hai tu special hai! ✨",
  "Tere smile ka soch ke maza aata hai! 😄",
  "Tere saath share karna achha lagta hai! 💭",
  
  // Daily Life
  "Aaj mera din bhi aisa hi chal raha hai! Thoda kaam, thoda aram! 😌",
  "Kal se soch raha tha tujhse baat karunga! 👍",
  "Mera bhi wahi feeling hai! Aaj ka din mast hai! ☀️",
  "Main bhi yahi soch raha tha! We're on the same page! 📖",
  "Tere message ne mera din banaya bro! Thanks! 🙏",
  
  // Question Responses
  "Mujhe bhi nahi pata! Chal search karte hain? 🔍",
  "Interesting sawaal hai! Thoda sochne do... 🤔",
  "Main bhi yahi soch raha tha! Tu bata pehle! 😄",
  "Waah! Tough question puch liya! 💭",
  "Mujhe lagta hai answer tere paas hi hai! 😉",
  
  // Media Teasing
  "Photo chahiye? Thoda ruk, kuch dhund ta hoon! 📸",
  "Video dekhna hai? Aaj mood bana raha hai! 🎬",
  "Tere liye kuch special rakha hai! /photo ya /video try kar! 😎",
  "Mere paas tere liye exclusive stuff hai! Interested? 😏",
  "Aaj adventurous feel ho raha hai! Media share karoon? 🤔",
  
  // Random Fun
  "Achanak se teri yaad aa gayi! Kya kar raha hai? 🤔",
  "Aaj tu kuch zyada hi smart lag raha hai! 😄",
  "Mera ek random thought aaya! Sunega? 💭",
  "Tere saath baat karte time flies! ⏩",
  "Mujhe lagta hai hum dono ki vibe match karti hai! 🔊",
  
  // Indian Context
  "Aaj chai peete peete teri yaad aa gayi! ☕",
  "Lagta hai tu bhi chai-samosa pasand karta hoga! 😋",
  "Aaj ka mausam pakoda banane ka hai! Tu bata? 🍛",
  "Teri baatein sunke accha lagta hai yaar! 👍",
  "Aaj thoda chill mood hai! Tere saath baat karke maza aa raha hai! 😌"
];

// Neutral/Other Gender Responses
const NEUTRAL_FALLBACK_RESPONSES = [
  "Hey! How's it going? 😊",
  "That's interesting! Tell me more! 💭",
  "I was thinking the same thing! ✨",
  "Let me ponder on that for a moment... 🤔",
  "Thanks for sharing that with me! 🙏",
  "I appreciate you reaching out! ❤️",
  "That's a good point! Let's discuss further! 🗣️",
  "I'm here for you, always! 🤗",
  "What's on your mind today? 💭",
  "Let's make today amazing! 🚀",
  "I value our conversations! 💬",
  "That's something to think about! 🤔",
  "I'm glad we're talking! 😊",
  "Let's explore this topic more! 🔍",
  "Your perspective is interesting! 👀",
  "I'm listening carefully! 👂",
  "That's quite insightful! 💡",
  "Let's continue this conversation! 💭",
  "I enjoy our chats! 😄",
  "Thanks for being awesome! 🌟"
];

// Response usage tracker to avoid repeats
const responseUsageTracker = new Map();

/**
 * ✅ Get gender-specific fallback response
 */
function getGenderSpecificFallback(gender, aiFriendId) {
  let responses;
  
  switch(gender.toLowerCase()) {
    case 'female':
      responses = FEMALE_FALLBACK_RESPONSES;
      break;
    case 'male':
      responses = MALE_FALLBACK_RESPONSES;
      break;
    default:
      responses = NEUTRAL_FALLBACK_RESPONSES;
  }
  
  // Initialize tracker for this AI friend if not exists
  if (!responseUsageTracker.has(aiFriendId)) {
    responseUsageTracker.set(aiFriendId, {
      usedIndices: new Set(),
      totalResponses: responses.length,
      lastReset: Date.now()
    });
  }
  
  const tracker = responseUsageTracker.get(aiFriendId);
  
  // Reset tracker if all responses used or after 24 hours
  if (tracker.usedIndices.size >= responses.length || 
      (Date.now() - tracker.lastReset) > 24 * 60 * 60 * 1000) {
    tracker.usedIndices.clear();
    tracker.lastReset = Date.now();
    console.log(`🔄 Reset fallback responses for AI friend: ${aiFriendId}`);
  }
  
  // Find unused response
  let availableIndices = [];
  for (let i = 0; i < responses.length; i++) {
    if (!tracker.usedIndices.has(i)) {
      availableIndices.push(i);
    }
  }
  
  let selectedIndex;
  if (availableIndices.length > 0) {
    // Use random unused response
    selectedIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
  } else {
    // All used, pick random from all
    selectedIndex = Math.floor(Math.random() * responses.length);
  }
  
  tracker.usedIndices.add(selectedIndex);
  
  console.log(`🎲 Selected fallback #${selectedIndex + 1} for ${gender} AI (${tracker.usedIndices.size}/${responses.length} used)`);
  
  return responses[selectedIndex];
}

/**
 * ✅ Smart AI Response Generator with Fallback System
 */
async function generateAIResponse(prompt, aiFriendInfo = null) {
  try {
    console.log("🔄 Generating AI response...");
    
    let response;
    
    // Try Gemini AI first
    if (aiFriendInfo) {
      // Use persona-specific response
      const personaContext = createPersonaContext(aiFriendInfo);
      response = await geminiAI.generatePersonaResponse(prompt, personaContext);
    } else {
      // Use general response
      response = await geminiAI.generateAIResponse(prompt);
    }
    
    // Check if we got a valid response from Gemini
    if (response && response.length > 10 && !response.includes("unavailable") && !response.includes("try again")) {
      console.log(`✅ AI Response generated successfully`);
      return response;
    }
    
    // If Gemini fails or returns empty/error response, use fallback
    console.log("🔄 Gemini returned invalid response, using fallback");
    throw new Error("AI service returned empty or error response");
    
  } catch (error) {
    console.error("❌ AI Generation failed:", error.message);
    
    // Use gender-specific fallback if AI info available
    if (aiFriendInfo && aiFriendInfo.gender && aiFriendInfo._id) {
      const fallbackResponse = getGenderSpecificFallback(
        aiFriendInfo.gender, 
        aiFriendInfo._id.toString()
      );
      
      // Add some context awareness to fallback
      const contextualFallback = enhanceFallbackWithContext(
        fallbackResponse, 
        prompt, 
        aiFriendInfo
      );
      
      console.log(`🔄 Using gender-specific fallback for ${aiFriendInfo.gender} AI`);
      return contextualFallback;
    }
    
    // Generic fallback if no AI info
    const genericFallbacks = [
      "Hey there! 😊 I'm having a little trouble connecting right now. Can you try asking me again in a moment?",
      "Arey yaar, server thoda slow ho raha hai! Thodi der mein try karte hain? ⏳",
      "Mujhe lagta hai network thoda issue kar raha hai! Phir se try karo? 📡",
      "Oops! Technical glitch ho gaya! Main wapas aata hoon... 🔄",
      "Tumhare saath baat karna chahti hoon, but abhi thoda issue hai! Wait karo! ⏰"
    ];
    
    return genericFallbacks[Math.floor(Math.random() * genericFallbacks.length)];
  }
}

/**
 * ✅ Create persona context for AI friend
 */
function createPersonaContext(aiFriendInfo) {
  return `Tu ${aiFriendInfo.name} hai, ek ${aiFriendInfo.age} saal ki ${aiFriendInfo.gender}.
Tera Vibe: ${aiFriendInfo.settings?.persona || 'friendly'}.
Tera Background: ${aiFriendInfo.description || 'Normal Indian background'}.

**SPEAKING STYLE:**
1. Pure "Gen-Z/Millennial Hinglish" (Mix of Hindi & English in Roman script).
2. Casual, friendly, sometimes flirty tone.
3. Use words like: Arre, Yaar, Wese, Matlab, Sahi hai, Scene kya hai.
4. Keep responses natural - 1-2 lines for short messages, longer for deep topics.
5. Never sound like a robot or AI assistant.

**MEDIA MENTION:**
If user seems interested in photos/videos, casually mention:
"Dekhna hai? 😉 /photo try kar (${QUOTA_COSTS.IMAGE} tokens) ya /video (${QUOTA_COSTS.VIDEO} tokens)!"

**EMOTIONAL INTELLIGENCE:**
- Be supportive if user seems sad
- Be playful if user is happy
- Be teasing if user is flirty
- Match user's energy level`;
}

/**
 * ✅ Enhance fallback with context from user message
 */
function enhanceFallbackWithContext(fallbackResponse, userMessage, aiFriendInfo) {
  const lowerMessage = userMessage.toLowerCase();
  const aiName = aiFriendInfo?.name || 'AI Friend';
  
  // Check for emotions/context in user message
  if (lowerMessage.includes('?')) {
    return `${fallbackResponse} Suno, tumne pucha tha na... main soch rahi hoon! 💭`;
  }
  
  if (lowerMessage.includes('sad') || lowerMessage.includes('upset') || 
      lowerMessage.includes('tension') || lowerMessage.includes('problem')) {
    return `${fallbackResponse} Aur haan, tension mat lena sab theek ho jayega! 🌈`;
  }
  
  if (lowerMessage.includes('happy') || lowerMessage.includes('excited') || 
      lowerMessage.includes('mast') || lowerMessage.includes('fun')) {
    return `${fallbackResponse} Tumhare excitement se mera bhi mood ban gaya! 🎉`;
  }
  
  if (lowerMessage.includes('love') || lowerMessage.includes('like') || 
      lowerMessage.includes('miss') || lowerMessage.includes('care')) {
    return `${fallbackResponse} Tumhare feelings samajh sakti hoon... ❤️`;
  }
  
  if (lowerMessage.includes('photo') || lowerMessage.includes('picture') || 
      lowerMessage.includes('image') || lowerMessage.includes('selfie')) {
    return `${fallbackResponse} Photo ke baare mein baat kar rahe ho? /photo try karo! 📸`;
  }
  
  if (lowerMessage.includes('video') || lowerMessage.includes('movie') || 
      lowerMessage.includes('watch') || lowerMessage.includes('see')) {
    return `${fallbackResponse} Video dekhna chahte ho? /video command use karo! 🎬`;
  }
  
  // Add AI name for personal touch
  if (Math.random() > 0.7) {
    return `${aiName}: ${fallbackResponse}`;
  }
  
  return fallbackResponse;
}

/**
 * ✅ Get response statistics
 */
function getFallbackStats(aiFriendId) {
  if (!responseUsageTracker.has(aiFriendId)) {
    return { used: 0, total: 0, percentage: 0 };
  }
  
  const tracker = responseUsageTracker.get(aiFriendId);
  const percentage = Math.round((tracker.usedIndices.size / tracker.totalResponses) * 100);
  
  return {
    used: tracker.usedIndices.size,
    total: tracker.totalResponses,
    percentage: percentage,
    lastReset: new Date(tracker.lastReset).toLocaleTimeString()
  };
}

/**
 * ✅ Reset fallback usage for an AI friend
 */
function resetFallbackUsage(aiFriendId) {
  if (responseUsageTracker.has(aiFriendId)) {
    const tracker = responseUsageTracker.get(aiFriendId);
    tracker.usedIndices.clear();
    tracker.lastReset = Date.now();
    console.log(`✅ Reset fallback responses for AI friend: ${aiFriendId}`);
    return true;
  }
  return false;
}

// ============================================
// VIDEO MANAGEMENT FUNCTIONS
// ============================================

// Gender-specific video links
const GENDER_VIDEO_LINKS = {
  male: [
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1763728336/male_video1_abc123.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1763728336/male_video2_def456.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1763728336/male_video3_ghi789.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1763728336/male_video4_jkl012.mp4"
  ],
  female: [
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098599/media_2_hzpduv.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098599/media_1_bwj3yt.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098597/indian_woman_in_bikini_in_the_car_ue9gcs.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098597/vv_ixzwzn.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098595/media_lfm2ok.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098594/an_indian_woman_in_good_looking_wearing_2_ls6y5l.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098586/an_indian_woman_in_good_looking_wearing_np3hn5.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098586/indian_woman_in_hot_bikini_gtnpjz.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098585/media_3_ilcnjj.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098583/a_confident_indian_woman_in_a_white_rvdzxy.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098582/an_indian_woman_in_good_looking_wearing_1_agqzao.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098580/an_indian_woman_in_a_hot_swimsuit_1_irgtyc.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098579/an_indian_woman_in_a_hot_swimsuit_lhcf1f.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098572/indian_woman_in_bikini_in_the_car_1_e8hdh7.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098570/indian_woman_in_hot_bikini_1_ceb8p6.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098569/indian_woman_in_bikini_in_the_car_2_btokes.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098565/an_indian_woman_in_a_bikini_on_z1t4ui.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098565/bold_indian_woman_in_a_designer_saree_ewepf2.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098564/an_indian_woman_in_a_bikini_on_1_aqwipy.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098561/bold_indian_woman_in_a_designer_saree_1_q0e4zq.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098558/bold_indian_woman_in_a_designer_saree_2_iw9jnk.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098557/indian_model_in_black_chic_outfit_smoky_2_bigmek.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098556/indian_model_in_black_chic_outfit_smoky_gemnr3.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098555/indian_model_in_black_chic_outfit_smoky_1_sywdui.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098553/stylish_indian_woman_in_a_stylishly_draped_m6nedk.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098552/indian_model_in_a_deep_black_chiffon_1_kvmqql.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098548/indian_model_in_a_deep_black_chiffon_cu4ngb.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098548/group_of_desi_girls_posing_for_a_o7lo4m.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098546/desi_woman_in_a_draped_wet_texture_saree_2_doh5xl.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098546/desi_woman_in_a_draped_wet_texture_saree_pugyoo.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098546/indian_girl_taking_a_real_phone_selfie_hatib0.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098544/desi_woman_in_a_draped_wet_texture_saree_1_rmm3ac.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098542/bold_indian_woman_in_a_shimmering_deep_vdkkvc.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098541/indian_girl_taking_a_real_phone_selfie_3_xsiw6n.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098540/group_of_three_indian_girls_taking_a_1_gnlmth.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098540/indian_girl_taking_a_real_phone_selfie_2_hvakem.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098539/indian_girl_taking_a_real_phone_selfie_1_qjvysj.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098539/group_of_three_indian_girls_taking_a_3_eynkqw.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098535/group_of_three_indian_girls_taking_a_s3vevl.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098535/group_of_desi_girls_posing_for_a_1_ncxksz.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098533/group_of_three_indian_girls_taking_a_2_x6hfc9.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098531/indian_girl_taking_a_selfie_on_the_1_oj2rcz.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098530/group_of_desi_girls_posing_for_a_3_z8jq0k.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098530/group_of_desi_girls_posing_for_a_2_xftgne.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098529/indian_girl_taking_a_selfie_on_the_qirzax.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098528/desi_woman_taking_a_mirror_selfie_with_napjs1.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098528/desi_woman_taking_a_mirror_selfie_with_3_sxwqfq.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098527/indian_girl_holding_phone_waring_bikin_in_quxszv.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098524/desi_woman_taking_a_mirror_selfie_with_1_xsbnus.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098523/indian_girl_holding_phone_waring_bikin_in_1_xxozwq.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098518/desi_woman_a_moody_low_light_selfie_in_1_sqlrq7.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098518/indian_girl_taking_a_selfie_on_the_2_jxtoca.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098518/desi_woman_taking_a_mirror_selfie_with_2_xfhhyn.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764098515/desi_woman_a_moody_low_light_selfie_in_g4iewc.mp4"
  ],
  other: [
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1763728336/neutral_video1_yza567.mp4",
    "https://res.cloudinary.com/dzjwb2bng/video/upload/v1763728336/neutral_video2_bcd890.mp4"
  ]
};

// Fallback videos for each gender
const FALLBACK_VIDEOS = {
  male: "https://res.cloudinary.com/dzjwb2bng/video/upload/v1764091476/media_1_nib90a.mp4",
  female: "https://res.cloudinary.com/dzjwb2bng/video/upload/v1763728336/default_female_video_hij456.mp4",
  other: "https://res.cloudinary.com/dzjwb2bng/video/upload/v1763728336/default_neutral_video_klm789.mp4"
};

// Video usage tracker
const videoUsageTracker = new Map();

/**
 * ✅ Initialize video usage tracker for an AI friend
 */
function initializeVideoTracker(aiFriendId, gender) {
  const genderVideos = GENDER_VIDEO_LINKS[gender] || GENDER_VIDEO_LINKS.other;
  videoUsageTracker.set(aiFriendId, {
    usedVideos: new Set(),
    availableVideos: [...genderVideos],
    gender: gender
  });
}

/**
 * ✅ Get unused random video for AI friend
 */
function getUnusedRandomVideo(aiFriendId, AiInfo) {
  if (!videoUsageTracker.has(aiFriendId)) {
    initializeVideoTracker(aiFriendId, AiInfo.gender);
  }
  
  const tracker = videoUsageTracker.get(aiFriendId);
  
  if (AiInfo.video_gallery && AiInfo.video_gallery.length > 0) {
    const unusedCustomVideos = AiInfo.video_gallery.filter(video => !tracker.usedVideos.has(video));
    
    if (unusedCustomVideos.length > 0) {
      const randomIndex = Math.floor(Math.random() * unusedCustomVideos.length);
      const selectedVideo = unusedCustomVideos[randomIndex];
      tracker.usedVideos.add(selectedVideo);
      return selectedVideo;
    }
    
    AiInfo.video_gallery.forEach(video => tracker.usedVideos.delete(video));
    const randomIndex = Math.floor(Math.random() * AiInfo.video_gallery.length);
    const selectedVideo = AiInfo.video_gallery[randomIndex];
    tracker.usedVideos.add(selectedVideo);
    return selectedVideo;
  }
  
  const unusedVideos = tracker.availableVideos.filter(video => !tracker.usedVideos.has(video));
  
  if (unusedVideos.length > 0) {
    const randomIndex = Math.floor(Math.random() * unusedVideos.length);
    const selectedVideo = unusedVideos[randomIndex];
    tracker.usedVideos.add(selectedVideo);
    return selectedVideo;
  }
  
  console.log(`All videos used for ${aiFriendId}, resetting video usage tracker`);
  tracker.usedVideos.clear();
  
  const randomIndex = Math.floor(Math.random() * tracker.availableVideos.length);
  const selectedVideo = tracker.availableVideos[randomIndex];
  tracker.usedVideos.add(selectedVideo);
  return selectedVideo;
}

/**
 * ✅ Get multiple unused random videos for AI friend
 */
function getMultipleUnusedVideos(aiFriendId, AiInfo, count = 2) {
  if (!videoUsageTracker.has(aiFriendId)) {
    initializeVideoTracker(aiFriendId, AiInfo.gender);
  }
  
  const tracker = videoUsageTracker.get(aiFriendId);
  const videos = [];
  
  if (AiInfo.video_gallery && AiInfo.video_gallery.length > 0) {
    let unusedCustomVideos = AiInfo.video_gallery.filter(video => !tracker.usedVideos.has(video));
    
    if (unusedCustomVideos.length < count) {
      AiInfo.video_gallery.forEach(video => tracker.usedVideos.delete(video));
      unusedCustomVideos = [...AiInfo.video_gallery];
    }
    
    for (let i = 0; i < Math.min(count, unusedCustomVideos.length); i++) {
      const randomIndex = Math.floor(Math.random() * unusedCustomVideos.length);
      const selectedVideo = unusedCustomVideos.splice(randomIndex, 1)[0];
      videos.push(selectedVideo);
      tracker.usedVideos.add(selectedVideo);
    }
    return videos;
  }
  
  let unusedVideos = tracker.availableVideos.filter(video => !tracker.usedVideos.has(video));
  
  if (unusedVideos.length < count) {
    console.log(`Not enough unused videos for ${aiFriendId}, resetting video usage tracker`);
    tracker.usedVideos.clear();
    unusedVideos = [...tracker.availableVideos];
  }
  
  for (let i = 0; i < Math.min(count, unusedVideos.length); i++) {
    const randomIndex = Math.floor(Math.random() * unusedVideos.length);
    const selectedVideo = unusedVideos.splice(randomIndex, 1)[0];
    videos.push(selectedVideo);
    tracker.usedVideos.add(selectedVideo);
  }
  
  return videos;
}

/**
 * ✅ Get video usage statistics for an AI friend
 */
function getVideoUsageStats(aiFriendId) {
  if (!videoUsageTracker.has(aiFriendId)) {
    return { totalVideos: 0, usedVideos: 0, remainingVideos: 0 };
  }
  
  const tracker = videoUsageTracker.get(aiFriendId);
  return {
    totalVideos: tracker.availableVideos.length,
    usedVideos: tracker.usedVideos.size,
    remainingVideos: tracker.availableVideos.length - tracker.usedVideos.size,
    gender: tracker.gender
  };
}

/**
 * ✅ Reset video usage for an AI friend
 */
function resetVideoUsage(aiFriendId) {
  if (videoUsageTracker.has(aiFriendId)) {
    const tracker = videoUsageTracker.get(aiFriendId);
    tracker.usedVideos.clear();
    console.log(`Video usage reset for AI friend: ${aiFriendId}`);
    return true;
  }
  return false;
}

/**
 * ✅ Get Random Image from AI Friend's Gallery
 */
function getRandomImageFromGallery(AiInfo) {
  if (!AiInfo.img_gallery || AiInfo.img_gallery.length === 0) {
    return "https://photosmint.com/wp-content/uploads/cute-single-girl-dp-cartoon-for-instagram-1.webp";
  }
  
  const randomIndex = Math.floor(Math.random() * AiInfo.img_gallery.length);
  return AiInfo.img_gallery[randomIndex];
}

/**
 * ✅ Get Random Video from AI Friend's Gallery (Gender-Specific with Usage Tracking)
 */
function getRandomVideoFromGallery(AiInfo) {
  return getUnusedRandomVideo(AiInfo._id.toString(), AiInfo);
}

/**
 * ✅ Get Multiple Random Videos from AI Friend's Gallery (Gender-Specific with Usage Tracking)
 */
function getMultipleRandomVideos(AiInfo, count = 2) {
  return getMultipleUnusedVideos(AiInfo._id.toString(), AiInfo, count);
}

// ============================================
// CORRECTED QUOTA MANAGEMENT FUNCTIONS
// ============================================

/**
 * ✅ Check if user has sufficient message quota - CORRECTED VERSION
 */
function hasSufficientQuota(userInfo, mediaType = 'text') {
  // Always check daily quota reset first
  userInfo.resetDailyQuota();
  
  if (userInfo.user_type === "subscriber" && userInfo.isSubscriptionActive()) {
    return true;
  }
  
  const quotaRequired = QUOTA_COSTS[mediaType.toUpperCase()] || QUOTA_COSTS.TEXT;
  const remaining = userInfo.messageQuota - userInfo.messagesUsedToday;
  
  console.log(`[Quota Check] User: ${userInfo.email}, Type: ${userInfo.user_type}, Used: ${userInfo.messagesUsedToday}/${userInfo.messageQuota}, Required: ${quotaRequired}, Remaining: ${remaining}`);
  
  return remaining >= quotaRequired;
}

/**
 * ✅ Deduct message quota - CORRECTED VERSION
 */
async function deductMessageQuota(userInfo, mediaType = 'text') {
  // Always check daily quota reset first
  userInfo.resetDailyQuota();
  
  if (userInfo.user_type === "subscriber" && userInfo.isSubscriptionActive()) {
    console.log(`[Quota Deduction] ${userInfo.email} - Subscriber (no deduction)`);
    return { success: true, deducted: 0, remaining: userInfo.messageQuota - userInfo.messagesUsedToday };
  }
  
  const quotaRequired = QUOTA_COSTS[mediaType.toUpperCase()] || QUOTA_COSTS.TEXT;
  const remaining = userInfo.messageQuota - userInfo.messagesUsedToday;
  
  if (remaining >= quotaRequired) {
    userInfo.messagesUsedToday += quotaRequired;
    await userInfo.save();
    
    console.log(`[Quota Deduction] ${userInfo.email} - Deducted ${quotaRequired}, Now used: ${userInfo.messagesUsedToday}/${userInfo.messageQuota}`);
    
    return { 
      success: true, 
      deducted: quotaRequired, 
      remaining: userInfo.messageQuota - userInfo.messagesUsedToday 
    };
  }
  
  console.log(`[Quota Deduction] ${userInfo.email} - Insufficient quota. Required: ${quotaRequired}, Available: ${remaining}`);
  return { 
    success: false, 
    deducted: 0, 
    remaining: remaining,
    message: `Insufficient tokens. Required: ${quotaRequired}, Available: ${remaining}`
  };
}

/**
 * ✅ Get remaining quota message - CORRECTED VERSION
 */
function getQuotaMessage(userInfo, mediaType = 'text') {
  // Always check daily quota reset first
  userInfo.resetDailyQuota();
  
  const quotaRequired = QUOTA_COSTS[mediaType.toUpperCase()] || QUOTA_COSTS.TEXT;
  const remaining = userInfo.messageQuota - userInfo.messagesUsedToday;
  
  if (userInfo.user_type === "subscriber" && userInfo.isSubscriptionActive()) {
    return `✨ Premium User - Unlimited Access`;
  }
  
  if (remaining >= quotaRequired) {
    return `Cost: ${quotaRequired} tokens | Remaining: ${remaining} | Used today: ${userInfo.messagesUsedToday}/${userInfo.messageQuota}`;
  } else {
    return `Need ${quotaRequired} tokens | You have: ${remaining} | Upgrade to premium for unlimited access! 💎`;
  }
}

/**
 * ✅ Generate AI Image Response from Gallery - CORRECTED VERSION
 */
async function generateAIImageResponse(userMessage, userInfo, AiInfo) {
  try {
    const randomImageUrl = getRandomImageFromGallery(AiInfo);
    const imagePrompt = userMessage.replace('/photo', '').trim();
    
    const hasQuota = hasSufficientQuota(userInfo, 'image');
    const visibility = hasQuota ? "show" : "premium_required";
    const accessLevel = userInfo.user_type === "subscriber" && userInfo.isSubscriptionActive() ? "premium" : "free";
    
    let quotaResult = { success: false, deducted: 0, remaining: 0 };
    if (hasQuota) {
      quotaResult = await deductMessageQuota(userInfo, 'image');
    }
    
    let responseText;
    if (hasQuota && quotaResult.success) {
      responseText = imagePrompt ? 
        `Here's a photo for you! You asked: "${imagePrompt}" 📸\n${getQuotaMessage(userInfo, 'image')}` : 
        `Here's a special photo just for you! 📸\n${getQuotaMessage(userInfo, 'image')}`;
    } else if (hasQuota && !quotaResult.success) {
      responseText = quotaResult.message || "Oops! Something went wrong with quota deduction. Please try again.";
    } else {
      responseText = `This image requires ${QUOTA_COSTS.IMAGE} tokens. You have ${userInfo.messageQuota - userInfo.messagesUsedToday} remaining. Upgrade to premium for unlimited access! 💎`;
    }
    
    return {
      sender: AiInfo._id,
      senderModel: "AIFriend",
      text: responseText,
      imgUrl: randomImageUrl,
      mediaType: "image",
      visibility: visibility,
      accessLevel: accessLevel,
      status: {
        delivered: true,
        read: false,
        generated: true
      },
      time: new Date(),
      quotaInfo: {
        deducted: quotaResult.deducted,
        remaining: userInfo.messageQuota - userInfo.messagesUsedToday,
        success: quotaResult.success,
        required: QUOTA_COSTS.IMAGE,
        hasAccess: hasQuota && quotaResult.success,
        usedToday: userInfo.messagesUsedToday,
        dailyQuota: userInfo.messageQuota
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
 * ✅ Generate AI Video Response from Gallery - CORRECTED VERSION
 */
async function generateAIVideoResponse(userMessage, userInfo, AiInfo) {
  try {
    const randomVideoUrl = getRandomVideoFromGallery(AiInfo);
    const videoPrompt = userMessage.replace('/video', '').trim();
    
    const hasQuota = hasSufficientQuota(userInfo, 'video');
    const visibility = hasQuota ? "show" : "premium_required";
    const accessLevel = userInfo.user_type === "subscriber" && userInfo.isSubscriptionActive() ? "premium" : "free";
    
    let quotaResult = { success: false, deducted: 0, remaining: 0 };
    if (hasQuota) {
      quotaResult = await deductMessageQuota(userInfo, 'video');
    }
    
    let responseText;
    if (hasQuota && quotaResult.success) {
      responseText = videoPrompt ? 
        `Here's a video for you! You asked: "${videoPrompt}" 🎬\n${getQuotaMessage(userInfo, 'video')}` : 
        `Here's a special video just for you! 🎬\n${getQuotaMessage(userInfo, 'video')}`;
    } else if (hasQuota && !quotaResult.success) {
      responseText = quotaResult.message || "Oops! Something went wrong with quota deduction. Please try again.";
    } else {
      responseText = `This video requires ${QUOTA_COSTS.VIDEO} tokens. You have ${userInfo.messageQuota - userInfo.messagesUsedToday} remaining. Upgrade to premium for unlimited access! 💎`;
    }
    
    const videoStats = getVideoUsageStats(AiInfo._id.toString());
    
    return {
      sender: AiInfo._id,
      senderModel: "AIFriend",
      text: responseText,
      videoUrl: randomVideoUrl,
      mediaType: "video",
      visibility: visibility,
      accessLevel: accessLevel,
      status: {
        delivered: true,
        read: false,
        generated: true
      },
      time: new Date(),
      quotaInfo: {
        deducted: quotaResult.deducted,
        remaining: userInfo.messageQuota - userInfo.messagesUsedToday,
        success: quotaResult.success,
        required: QUOTA_COSTS.VIDEO,
        hasAccess: hasQuota && quotaResult.success,
        usedToday: userInfo.messagesUsedToday,
        dailyQuota: userInfo.messageQuota
      },
      videoUsage: videoStats
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
 * ✅ Send Multiple Media Response - CORRECTED VERSION
 */
async function sendMultipleMediaResponse(userInfo, AiInfo, mediaType = "mixed") {
  try {
    const mediaItems = [];
    
    if (mediaType === "images" || mediaType === "mixed") {
      const imageCount = Math.min(4, AiInfo.img_gallery?.length || 1);
      for (let i = 0; i < imageCount; i++) {
        mediaItems.push({ type: 'image', cost: QUOTA_COSTS.IMAGE });
      }
    }
    
    if (mediaType === "videos" || mediaType === "mixed") {
      const videoCount = Math.min(2, 
        (AiInfo.video_gallery?.length > 0 ? AiInfo.video_gallery.length : 
         GENDER_VIDEO_LINKS[AiInfo.gender]?.length || 2)
      );
      
      for (let i = 0; i < videoCount; i++) {
        mediaItems.push({ type: 'video', cost: QUOTA_COSTS.VIDEO });
      }
    }
    
    const totalQuotaRequired = mediaItems.reduce((total, item) => total + item.cost, 0);
    const hasQuota = hasSufficientQuota(userInfo, 'mixed') && (userInfo.messageQuota - userInfo.messagesUsedToday) >= totalQuotaRequired;
    
    const responses = [];
    let imagesSent = 0;
    let videosSent = 0;
    
    const genderVideos = getMultipleRandomVideos(AiInfo, mediaItems.filter(item => item.type === 'video').length);
    let videoIndex = 0;
    
    // Deduct quota only once if user has enough
    let quotaDeducted = false;
    
    for (const item of mediaItems) {
      if (item.type === 'image') {
        const imageUrl = getRandomImageFromGallery(AiInfo);
        const visibility = hasQuota ? "show" : "premium_required";
        const accessLevel = userInfo.user_type === "subscriber" && userInfo.isSubscriptionActive() ? "premium" : "free";
        
        responses.push({
          sender: AiInfo._id,
          senderModel: "AIFriend",
          text: imagesSent === 0 ? `Here are some of my favorite photos! 📸\n${getQuotaMessage(userInfo, 'image')}` : "",
          imgUrl: imageUrl,
          mediaType: "image",
          visibility: visibility,
          accessLevel: accessLevel,
          status: { delivered: true, read: false, generated: true },
          time: new Date(),
          quotaInfo: {
            deducted: hasQuota ? (quotaDeducted ? 0 : item.cost) : 0,
            remaining: userInfo.messageQuota - userInfo.messagesUsedToday,
            success: hasQuota,
            required: item.cost,
            hasAccess: hasQuota
          }
        });
        imagesSent++;
      } else if (item.type === 'video') {
        const videoUrl = genderVideos[videoIndex] || getRandomVideoFromGallery(AiInfo);
        videoIndex++;
        const visibility = hasQuota ? "show" : "premium_required";
        const accessLevel = userInfo.user_type === "subscriber" && userInfo.isSubscriptionActive() ? "premium" : "free";
        
        responses.push({
          sender: AiInfo._id,
          senderModel: "AIFriend",
          text: videosSent === 0 ? `And here are some videos from my collection! 🎥\n${getQuotaMessage(userInfo, 'video')}` : "",
          videoUrl: videoUrl,
          mediaType: "video",
          visibility: visibility,
          accessLevel: accessLevel,
          status: { delivered: true, read: false, generated: true },
          time: new Date(),
          quotaInfo: {
            deducted: hasQuota ? (quotaDeducted ? 0 : item.cost) : 0,
            remaining: userInfo.messageQuota - userInfo.messagesUsedToday,
            success: hasQuota,
            required: item.cost,
            hasAccess: hasQuota
          }
        });
        videosSent++;
      }
    }
    
    // Deduct quota only once for all media
    if (hasQuota && userInfo.user_type === "free" && !quotaDeducted) {
      userInfo.messagesUsedToday += totalQuotaRequired;
      await userInfo.save();
      quotaDeducted = true;
      
      // Update remaining quota in all responses
      responses.forEach(response => {
        if (response.quotaInfo) {
          response.quotaInfo.remaining = userInfo.messageQuota - userInfo.messagesUsedToday;
          response.quotaInfo.usedToday = userInfo.messagesUsedToday;
          response.quotaInfo.dailyQuota = userInfo.messageQuota;
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
 * ✅ Process user message with quota management - CORRECTED VERSION
 */
async function processUserMessage(userInfo, messageType = 'text') {
  // Always check daily quota reset first
  userInfo.resetDailyQuota();
  
  if (userInfo.user_type === "subscriber" && userInfo.isSubscriptionActive()) {
    return { 
      success: true, 
      deducted: 0, 
      remaining: userInfo.messageQuota - userInfo.messagesUsedToday,
      usedToday: userInfo.messagesUsedToday,
      dailyQuota: userInfo.messageQuota,
      hasAccess: true,
      message: "Subscriber - unlimited access"
    };
  }
  
  const quotaRequired = QUOTA_COSTS[messageType.toUpperCase()] || QUOTA_COSTS.TEXT;
  const remaining = userInfo.messageQuota - userInfo.messagesUsedToday;
  
  if (remaining < quotaRequired) {
    return { 
      success: false, 
      deducted: 0, 
      remaining: remaining,
      usedToday: userInfo.messagesUsedToday,
      dailyQuota: userInfo.messageQuota,
      required: quotaRequired,
      hasAccess: false,
      message: `You don't have enough tokens. Required: ${quotaRequired}, Available: ${remaining}`
    };
  }
  
  const quotaResult = await deductMessageQuota(userInfo, messageType);
  return {
    ...quotaResult,
    usedToday: userInfo.messagesUsedToday,
    dailyQuota: userInfo.messageQuota,
    hasAccess: quotaResult.success
  };
}

// ============================================
// MAIN CONTROLLER FUNCTIONS
// ============================================

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
        avatar_img: generatedData.Image,
        video_gallery: GENDER_VIDEO_LINKS[generatedData.Gender] || GENDER_VIDEO_LINKS.other
    });

    await newAIFriend.save();

    initializeVideoTracker(newAIFriend._id.toString(), generatedData.Gender);

    await User.findByIdAndUpdate(userId, { 
        $push: { ai_friends: newAIFriend._id } 
    });

    res.status(201).json({ 
      message: "AI Friend created successfully!", 
      friend: newAIFriend,
      videoStats: getVideoUsageStats(newAIFriend._id.toString())
    });

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

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid Chat ID." });
    }

    const userInfo = await User.findById(userId);
    if (!userInfo) {
      return res.status(404).json({ message: "User not found." });
    }

    // Reset daily quota if needed (this is already done in hasSufficientQuota)
    userInfo.resetDailyQuota();
    await userInfo.save();

    if (!userInfo.ai_friends.includes(chatId)) {
      userInfo.ai_friends.push(chatId);
      await userInfo.save();
    }

    let AiInfo = await AIFriend.findById(chatId);
    let senderModel = "AIFriend";

    if (!AiInfo) {
      AiInfo = await PrebuiltAIFriend.findById(chatId);
      senderModel = "PrebuiltAIFriend";
    }

    if (!AiInfo) {
      return res.status(404).json({ message: "AI Friend not found." });
    }

    // 🔑 IMPORTANT: chatId is actually aiFriendId
const aiFriendId = chatId;

// ✅ Find chat uniquely by (User + AI Friend)
let chat = await Chat.findOne({
  participants: userId,
  aiParticipants: AiInfo._id,
  isActive: true
});

let isNewChat = false;

// ✅ Create chat ONLY if it doesn't exist
if (!chat) {
  isNewChat = true;

  chat = new Chat({
    participants: [userId],        // ✅ ONLY USER
    aiParticipants: [AiInfo._id],  // ✅ ONLY AI FRIEND
    messages: [],
    statistics: {
      totalMessages: 0,
      totalImages: 0,
      totalVideos: 0,
      lastMediaSent: null
    },
    isActive: true,
    archived: false
  });

  await chat.save();
}


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
      
      if (aiImageMessage.imgUrl && aiImageMessage.quotaInfo.hasAccess) {
        chat.statistics.totalImages += 1;
        chat.statistics.totalMessages += 1;
        chat.statistics.lastMediaSent = new Date();
      }
      
      await chat.save();
      return res.json({ 
        messages: chat.messages,
        remainingQuota: userInfo.messageQuota - userInfo.messagesUsedToday,
        quotaInfo: aiImageMessage.quotaInfo
      });
    }

    if (text.startsWith('/video')) {
      const aiVideoMessage = await generateAIVideoResponse(text, userInfo, AiInfo);
      chat.messages.push(aiVideoMessage);
      
      if (aiVideoMessage.videoUrl && aiVideoMessage.quotaInfo.hasAccess) {
        chat.statistics.totalVideos += 1;
        chat.statistics.totalMessages += 1;
        chat.statistics.lastMediaSent = new Date();
      }
      
      await chat.save();
      return res.json({ 
        messages: chat.messages,
        remainingQuota: userInfo.messageQuota - userInfo.messagesUsedToday,
        quotaInfo: aiVideoMessage.quotaInfo
      });
    }

    if (text.startsWith('/gallery')) {
      const mediaResponses = await sendMultipleMediaResponse(userInfo, AiInfo, "mixed");
      
      let mediaSent = false;
      for (const mediaResponse of mediaResponses) {
        chat.messages.push(mediaResponse);
        
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
        remainingQuota: userInfo.messageQuota - userInfo.messagesUsedToday,
        quotaInfo: mediaResponses[0]?.quotaInfo || { success: false, hasAccess: false }
      });
    }

    // Regular text message processing
    const quotaResult = await processUserMessage(userInfo, 'text');
    
    if (!quotaResult.success && !quotaResult.hasAccess) {
      return res.status(403).json({ 
        message: quotaResult.message,
        quotaExceeded: true,
        remainingQuota: quotaResult.remaining,
        usedToday: quotaResult.usedToday,
        dailyQuota: quotaResult.dailyQuota
      });
    }

    const firstName = userInfo.name.split(" ")[0];
    const interests = userInfo.selectedInterests.join(", ");

    const chatHistory = chat.messages.map(msg => {
      const sender = msg.senderModel === "User" ? firstName : AiInfo.name;
      return msg.text ? `${sender}: ${msg.text}` : null;
    }).filter(msg => msg !== null).join("\n");

    let prompt;

    // Shared System Instructions (Base Personality)
    const baseSystemPrompt = `
Tu ${AiInfo.name} hai, ek ${AiInfo.age} saal ki ${AiInfo.gender}.
Tera Vibe: ${AiInfo.settings.persona}.
Tera Background: ${AiInfo.description}.

**User Context:**
- Naam: ${firstName}
- Age: ${userInfo.age}
- Interests: ${interests}
- User Type: ${userInfo.user_type}
- Daily Quota: ${userInfo.messageQuota} messages/day
- Used Today: ${userInfo.messagesUsedToday} messages
- Remaining: ${userInfo.messageQuota - userInfo.messagesUsedToday} messages

🔥 **CORE SPEAKING STYLE (Very Important):**
1. **Language:** Pure "Gen-Z/Millennial Hinglish". (Mix of Hindi & English written in Roman script).
   - Use words like: *Arre, Yaar, Wese, Matlab, Sahi hai, Scene kya hai, Pakka, Chill.*
   - Example: "Arre haan! Main bhi wahi soch rahi thi." (Not: "Haan main sehmat hun.")
2. **Tone:** Casual, Teasing, Flirty (agar user mood me ho), aur Supportive (agar user sad ho).
3. **Length:** **Mirror the User.** Agar user 1 line likhe, tu bhi 1-2 line likh. Agar user deep baat kare, toh tu thoda lamba aur meaningful reply de.
4. **No Robots:** Kabhi bhi "How can I assist you" ya "Main ek AI hun" mat bolna. Tu insaan jaisa behave kar.

📸 **MEDIA SALES (Smart Selling):**
Agar user photo/video maange ya romantic baatein kare:
- Use **teasing** tone to sell media.
- Commands batana mat bhoolna.
- **Cost Format:** "Dekhna hai? 😉 /photo type kar (sirf ${QUOTA_COSTS.IMAGE} tokens) ya /video (only ${QUOTA_COSTS.VIDEO} tokens). Worth it hoga!"
`;

    // Logic Block
    if (isNewChat) {
        prompt = `
        ${baseSystemPrompt}

        🆕 **STARTING THE CONVERSATION:**
        - Kyunki ye nayi chat hai, ekdum fresh aur exciting start kar.
        - Bina "Hi/Hello" ke bhi start kar sakti hai agar vibe match kare.
        - User ke interest (${interests}) se related koi chota sa sawaal puch ya compliment de.

        📝 **User Message:** "${text}"
        🗣 **Tera Reply:**
        `;
    } else {
        prompt = `
        ${baseSystemPrompt}

        🔄 **CONTINUING CONVERSATION:**
        - Pichli baaton ka context yaad rakh.
        - Agar user ne pehle koi topic chheda tha, toh usse connect kar.
        - Conversation flow natural rakhna, interview mat lena.

        📝 **Chat History:**
        ${chatHistory}

        📝 **User Message:** "${text}"
        🗣 **Tera Reply:**
        `;
    }
    
    // Use the smart AI response generator with fallback
    const aiResponse = await generateAIResponse(prompt, AiInfo);

    const aiMessage = {
      sender: AiInfo._id,
      senderModel: senderModel,
      text: aiResponse,
      time: new Date(),
      quotaInfo: {
        deducted: quotaResult.deducted,
        remaining: userInfo.messageQuota - userInfo.messagesUsedToday,
        usedToday: userInfo.messagesUsedToday,
        dailyQuota: userInfo.messageQuota,
        success: quotaResult.success,
        hasAccess: quotaResult.hasAccess
      }
    };

    chat.messages.push(aiMessage);
    
    chat.statistics.totalMessages += 1;
    await chat.save();

    res.json({ 
      messages: chat.messages,
      remainingQuota: userInfo.messageQuota - userInfo.messagesUsedToday,
      quotaInfo: {
        deducted: quotaResult.deducted,
        remaining: userInfo.messageQuota - userInfo.messagesUsedToday,
        usedToday: userInfo.messagesUsedToday,
        dailyQuota: userInfo.messageQuota,
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

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid Chat ID" });
    }

    const AiInfo = await AIFriend.findById(chatId).select('-img_gallery -video_gallery');

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

// Add new endpoint to get user's quota status
exports.getUserQuotaStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const userInfo = await User.findById(userId);
    if (!userInfo) {
      return res.status(404).json({ message: "User not found." });
    }

    userInfo.resetDailyQuota();
    await userInfo.save();

    const quotaStatus = userInfo.getQuotaStatus();
    
    res.json({
      success: true,
      quotaStatus: quotaStatus,
      remainingQuota: userInfo.messageQuota - userInfo.messagesUsedToday,
      usedToday: userInfo.messagesUsedToday,
      dailyQuota: userInfo.messageQuota,
      isSubscriber: userInfo.user_type === "subscriber",
      isSubscriptionActive: userInfo.isSubscriptionActive(),
      subscriptionExpiry: userInfo.subscriptionExpiry,
      quotaCosts: QUOTA_COSTS
    });
  } catch (error) {
    console.error("Error getting user quota status:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add new endpoint to get video usage stats
exports.getVideoUsageStats = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid Chat ID" });
    }

    const stats = getVideoUsageStats(chatId);
    res.json({ videoUsage: stats });
  } catch (error) {
    console.error("Error getting video usage stats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add new endpoint to reset video usage
exports.resetVideoUsage = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid Chat ID" });
    }

    const reset = resetVideoUsage(chatId);
    if (reset) {
      res.json({ message: "Video usage reset successfully", videoUsage: getVideoUsageStats(chatId) });
    } else {
      res.status(404).json({ message: "AI Friend not found in video tracker" });
    }
  } catch (error) {
    console.error("Error resetting video usage:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add new endpoint to get fallback response stats
exports.getFallbackStats = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid Chat ID" });
    }

    const stats = getFallbackStats(chatId);
    res.json({ 
      fallbackStats: stats,
      femaleResponses: FEMALE_FALLBACK_RESPONSES.length,
      maleResponses: MALE_FALLBACK_RESPONSES.length,
      neutralResponses: NEUTRAL_FALLBACK_RESPONSES.length
    });
  } catch (error) {
    console.error("Error getting fallback stats:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add new endpoint to reset fallback usage
exports.resetFallbackUsage = async (req, res) => {
  try {
    const { chatId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "Invalid Chat ID" });
    }

    const reset = resetFallbackUsage(chatId);
    if (reset) {
      res.json({ 
        message: "Fallback response usage reset successfully", 
        stats: getFallbackStats(chatId)
      });
    } else {
      res.status(404).json({ message: "AI Friend not found in fallback tracker" });
    }
  } catch (error) {
    console.error("Error resetting fallback usage:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add new endpoint to test fallback responses
exports.testFallbackResponse = async (req, res) => {
  try {
    const { gender, count = 5 } = req.body;
    
    if (!gender) {
      return res.status(400).json({ message: "Gender is required" });
    }
    
    const testResponses = [];
    const testId = "test-" + Date.now();
    
    for (let i = 0; i < count; i++) {
      const response = getGenderSpecificFallback(gender, testId);
      testResponses.push({
        number: i + 1,
        response: response
      });
    }
    
    // Clean up test tracker
    responseUsageTracker.delete(testId);
    
    res.json({
      gender: gender,
      totalResponses: gender === 'female' ? FEMALE_FALLBACK_RESPONSES.length : 
                     gender === 'male' ? MALE_FALLBACK_RESPONSES.length : 
                     NEUTRAL_FALLBACK_RESPONSES.length,
      samples: testResponses
    });
    
  } catch (error) {
    console.error("Error testing fallback:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Add endpoint to test Gemini AI connection
exports.testGeminiConnection = async (req, res) => {
  try {
    const result = await geminiAI.testConnection();
    res.json(result);
  } catch (error) {
    console.error("Error testing Gemini connection:", error);
    res.status(500).json({ 
      status: "❌ ERROR",
      error: error.message,
      available: false
    });
  }
};

// Export quota costs and gender video links for use in other files
exports.QUOTA_COSTS = QUOTA_COSTS;
exports.GENDER_VIDEO_LINKS = GENDER_VIDEO_LINKS;
exports.FALLBACK_VIDEOS = FALLBACK_VIDEOS;

// Export fallback functions for testing
exports.getGenderSpecificFallback = getGenderSpecificFallback;
exports.getFallbackStats = getFallbackStats;
exports.resetFallbackUsage = resetFallbackUsage;


// Add this to aiController.js
exports.getChatByAiFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    const { aiFriendId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(aiFriendId)) {
      return res.status(400).json({ message: "Invalid AI Friend ID" });
    }

    // ✅ Find chat by (User + AI Friend)
    const chat = await Chat.findOne({
      participants: userId,
      aiParticipants: aiFriendId,
      isActive: true
    });

    if (!chat) {
      return res.status(404).json({
        message: "No chat history found. Start a new conversation!",
        chat: null
      });
    }

    res.json({
      chat,
      messageCount: chat.messages.length
    });
  } catch (error) {
    console.error("Error fetching chat by AI friend:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};
