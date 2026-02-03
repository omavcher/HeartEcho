const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  aiParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: "AIFriend" }],

  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, refPath: "senderModel" },
      senderModel: {
        type: String,
        enum: ["User", "AIFriend", "PrebuiltAIFriend"]
      },
      text: String,
      time: { type: Date, default: Date.now },

      mediaType: {
        type: String,
        enum: ["text", "image", "video", "audio"],
        default: "text"
      },
      imgUrl: String,
      videoUrl: String,
      thumbnailUrl: String,
      mediaCaption: String,

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

      mediaMetadata: {
        width: Number,
        height: Number,
        duration: Number,
        fileSize: Number,
        format: String,
        aiModel: String,
        generationTime: Number
      },

      reactions: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          emoji: String,
          reactedAt: { type: Date, default: Date.now }
        }
      ],

      status: {
        delivered: { type: Boolean, default: false },
        read: { type: Boolean, default: false },
        generated: { type: Boolean, default: false }
      },

      views: { type: Number, default: 0 },
      lastViewedAt: Date
    }
  ],

  settings: {
    allowImages: { type: Boolean, default: true },
    allowVideos: { type: Boolean, default: true },
    maxMediaSize: { type: Number, default: 50 },
    autoDownloadMedia: { type: Boolean, default: false },
    compressMedia: { type: Boolean, default: true }
  },

  statistics: {
    totalMessages: { type: Number, default: 0 },
    totalImages: { type: Number, default: 0 },
    totalVideos: { type: Number, default: 0 },
    lastMediaSent: Date
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },

  isActive: { type: Boolean, default: true },
  archived: { type: Boolean, default: false }
});

// ✅ Auto-update timestamp
chatSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// 🔒 IMPORTANT: prevent duplicate chats per user+AI
chatSchema.index(
  { participants: 1, aiParticipants: 1 },
  { unique: true }
);

module.exports = mongoose.model("Chat", chatSchema);
