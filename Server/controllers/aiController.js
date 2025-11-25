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

// Video usage tracker - stores which videos have been used for each AI friend
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
  // Initialize tracker if not exists
  if (!videoUsageTracker.has(aiFriendId)) {
    initializeVideoTracker(aiFriendId, AiInfo.gender);
  }
  
  const tracker = videoUsageTracker.get(aiFriendId);
  
  // First, check if AI friend has custom videos
  if (AiInfo.video_gallery && AiInfo.video_gallery.length > 0) {
    const unusedCustomVideos = AiInfo.video_gallery.filter(video => !tracker.usedVideos.has(video));
    
    if (unusedCustomVideos.length > 0) {
      const randomIndex = Math.floor(Math.random() * unusedCustomVideos.length);
      const selectedVideo = unusedCustomVideos[randomIndex];
      tracker.usedVideos.add(selectedVideo);
      return selectedVideo;
    }
    
    // If all custom videos used, reset and use them again
    AiInfo.video_gallery.forEach(video => tracker.usedVideos.delete(video));
    const randomIndex = Math.floor(Math.random() * AiInfo.video_gallery.length);
    const selectedVideo = AiInfo.video_gallery[randomIndex];
    tracker.usedVideos.add(selectedVideo);
    return selectedVideo;
  }
  
  // Use gender-specific videos
  const unusedVideos = tracker.availableVideos.filter(video => !tracker.usedVideos.has(video));
  
  if (unusedVideos.length > 0) {
    const randomIndex = Math.floor(Math.random() * unusedVideos.length);
    const selectedVideo = unusedVideos[randomIndex];
    tracker.usedVideos.add(selectedVideo);
    return selectedVideo;
  }
  
  // If all videos used, reset and start over
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
  // Initialize tracker if not exists
  if (!videoUsageTracker.has(aiFriendId)) {
    initializeVideoTracker(aiFriendId, AiInfo.gender);
  }
  
  const tracker = videoUsageTracker.get(aiFriendId);
  const videos = [];
  
  // First, check if AI friend has custom videos
  if (AiInfo.video_gallery && AiInfo.video_gallery.length > 0) {
    let unusedCustomVideos = AiInfo.video_gallery.filter(video => !tracker.usedVideos.has(video));
    
    // If not enough unused videos, reset and use all available
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
  
  // Use gender-specific videos
  let unusedVideos = tracker.availableVideos.filter(video => !tracker.usedVideos.has(video));
  
  // If not enough unused videos, reset and use all available
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

/**
 * ✅ Check if user has sufficient message quota
 */
function hasSufficientQuota(userInfo, mediaType = 'text') {
  if (userInfo.user_type === "subscriber") {
    return true;
  }
  
  const quotaRequired = QUOTA_COSTS[mediaType.toUpperCase()] || QUOTA_COSTS.TEXT;
  return userInfo.messageQuota >= quotaRequired;
}

/**
 * ✅ Deduct message quota
 */
async function deductMessageQuota(userInfo, mediaType = 'text') {
  if (userInfo.user_type === "subscriber") {
    return { success: true, deducted: 0 };
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
    const randomImageUrl = getRandomImageFromGallery(AiInfo);
    const imagePrompt = userMessage.replace('/photo', '').trim();
    
    const hasQuota = hasSufficientQuota(userInfo, 'image');
    const visibility = hasQuota ? "show" : "premium_required";
    const accessLevel = userInfo.user_type === "subscriber" ? "premium" : "free";
    
    let quotaResult = { success: false, deducted: 0 };
    if (hasQuota) {
      quotaResult = await deductMessageQuota(userInfo, 'image');
    }
    
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
 * ✅ Generate AI Video Response from Gallery - ALWAYS SEND MEDIA (Gender-Specific with Usage Tracking)
 */
async function generateAIVideoResponse(userMessage, userInfo, AiInfo) {
  try {
    // Get gender-specific random video with usage tracking
    const randomVideoUrl = getRandomVideoFromGallery(AiInfo);
    const videoPrompt = userMessage.replace('/video', '').trim();
    
    const hasQuota = hasSufficientQuota(userInfo, 'video');
    const visibility = hasQuota ? "show" : "premium_required";
    const accessLevel = userInfo.user_type === "subscriber" ? "premium" : "free";
    
    let quotaResult = { success: false, deducted: 0 };
    if (hasQuota) {
      quotaResult = await deductMessageQuota(userInfo, 'video');
    }
    
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
    
    // Get video usage stats for logging
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
        remaining: userInfo.messageQuota,
        success: quotaResult.success,
        required: QUOTA_COSTS.VIDEO,
        hasAccess: hasQuota && quotaResult.success
      },
      videoUsage: videoStats // Include usage stats for debugging
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
 * ✅ Send Multiple Media Response (Images + Videos) - ALWAYS SEND MEDIA (Gender-Specific with Usage Tracking)
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
      // Get gender-specific videos with usage tracking
      const videoCount = Math.min(2, 
        (AiInfo.video_gallery?.length > 0 ? AiInfo.video_gallery.length : 
         GENDER_VIDEO_LINKS[AiInfo.gender]?.length || 2)
      );
      
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
    
    // Get gender-specific videos in advance with usage tracking
    const genderVideos = getMultipleRandomVideos(AiInfo, mediaItems.filter(item => item.type === 'video').length);
    let videoIndex = 0;
    
    // Generate responses for each media item
    for (const item of mediaItems) {
      if (item.type === 'image') {
        const imageUrl = getRandomImageFromGallery(AiInfo);
        const visibility = hasQuota ? "show" : "premium_required";
        const accessLevel = userInfo.user_type === "subscriber" ? "premium" : "free";
        
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
            deducted: hasQuota ? item.cost : 0,
            remaining: userInfo.messageQuota,
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
        const accessLevel = userInfo.user_type === "subscriber" ? "premium" : "free";
        
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
  if (userInfo.user_type === "subscriber") {
    return { success: true, deducted: 0, remaining: 999, hasAccess: true };
  }
  
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
        avatar_img: generatedData.Image,
        // Add gender-specific videos to the video gallery
        video_gallery: GENDER_VIDEO_LINKS[generatedData.Gender] || GENDER_VIDEO_LINKS.other
    });

    await newAIFriend.save();

    // Initialize video usage tracker for this AI friend
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
        remainingQuota: userInfo.messageQuota,
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
        remainingQuota: userInfo.messageQuota,
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

    const chatHistory = chat.messages.map(msg => {
      const sender = msg.senderModel === "User" ? firstName : AiInfo.name;
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

// Export quota costs and gender video links for use in other files
exports.QUOTA_COSTS = QUOTA_COSTS;
exports.GENDER_VIDEO_LINKS = GENDER_VIDEO_LINKS;
exports.FALLBACK_VIDEOS = FALLBACK_VIDEOS;