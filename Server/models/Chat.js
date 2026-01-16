const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  aiParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: "AIFriend" }],
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, refPath: "senderModel" },
      senderModel: { type: String, enum: ["User", "AIFriend", "PrebuiltAIFriend"] },
      text: String,
      time: { type: Date, default: Date.now },
      
      // ✅ New Media Fields
      mediaType: { 
        type: String, 
        enum: ["text", "image", "video", "audio"], 
        default: "text" 
      },
      imgUrl: String, // For AI generated images
      videoUrl: String, // For AI generated videos
      thumbnailUrl: String, // For video thumbnails
      mediaCaption: String, // Optional caption for media
      
      // ✅ Visibility and Access Control
      visibility: { 
        type: String, 
        enum: ["show", "premium_required", "hidden"], 
        default: "show" 
      },
      accessLevel: { 
        type: String, 
        enum: ["free", "premium", "all"], 
        default: "all" 
      },
      
      // ✅ Media Metadata
      mediaMetadata: {
        width: Number,
        height: Number,
        duration: Number, // For videos/audio
        fileSize: Number,
        format: String,
        aiModel: String, // Which AI model generated this
        generationTime: Number, // Time taken to generate in seconds
      },
      
      // ✅ Reactions
      reactions: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          emoji: String,
          reactedAt: { type: Date, default: Date.now }
        },
      ],
      
      // ✅ Message Status
      status: {
        delivered: { type: Boolean, default: false },
        read: { type: Boolean, default: false },
        generated: { type: Boolean, default: false } // For AI-generated content
      },
      
      // ✅ Analytics
      views: { type: Number, default: 0 },
      lastViewedAt: Date,
    },
  ],
  
  // ✅ Chat-level Media Settings
  settings: {
    allowImages: { type: Boolean, default: true },
    allowVideos: { type: Boolean, default: true },
    maxMediaSize: { type: Number, default: 50 }, // in MB
    autoDownloadMedia: { type: Boolean, default: false },
    compressMedia: { type: Boolean, default: true },
  },
  
  // ✅ Chat Statistica   scs
  statistics: {
    totalMessages: { type: Number, default: 0 },
    totalImages: { type: Number, default: 0 },
    totalVideos: { type: Number, default: 0 },
    lastMediaSent: Date,
  },
  
  // ✅ Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  
  // ✅ Soft Delete
  isActive: { type: Boolean, default: true },
  archived: { type: Boolean, default: false },
});

// ✅ Update the updatedAt field before saving
chatSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});


module.exports = mongoose.model("Chat", chatSchema);
