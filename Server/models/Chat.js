const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  participants: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  aiParticipants: { type: mongoose.Schema.Types.ObjectId, ref: "AIFriend" },

  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, refPath: "senderModel" },
      senderModel: {
        type: String,
        enum: ["User", "AIFriend", "PrebuiltAIFriend", "UserAIFriend", "LetterAIFriend", "AiLive"]
      },
      text: String,
      time: { type: Date, default: Date.now },

      mediaType: {
        type: String,
        enum: ["text", "image", "video", "audio", "gift", "date"],
        default: "text"
      },
      giftData: {
        giftId: String,
        name: String,
        price: Number,
        xp: Number
      },
      dateType: String,
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

  // Relationship Progression Economy
  streakCount: { type: Number, default: 0 },
  lastMessageDate: { type: Date },
  currentEmotion: { type: String, enum: ["Happy", "Sad", "Romantic", "Angry", "Busy", "Sleepy"], default: "Happy" },
  lastEmotionChange: { type: Date, default: Date.now },
  personality: { type: String, default: "Flirty" },
  relationshipXP: { type: Number, default: 0 },
  relationshipLevel: { type: Number, default: 1 }, // 1: Stranger, 2: Friend, etc.
  giftsSent: [
    {
      giftId: { type: String, required: true },
      name: { type: String, required: true },
      sentAt: { type: Date, default: Date.now }
    }
  ],
  datesCompleted: [
    {
      dateType: { type: String, required: true },
      completedAt: { type: Date, default: Date.now }
    }
  ],
  aiMemory: {
    birthday: { type: String, default: "" },
    job: { type: String, default: "" },
    favoriteFood: { type: String, default: "" },
    pet: { type: String, default: "" },
    mom: { type: String, default: "" },
    dream: { type: String, default: "" },
    nickname: { type: String, default: "" },
    fear: { type: String, default: "" },
    anniversary: { type: String, default: "" },
    favoriteColor: { type: String, default: "" }
  },
  stagesUnlocked: {
    stranger: { type: Date, default: Date.now },
    friend: { type: Date },
    close_friend: { type: Date },
    crush: { type: Date },
    dating: { type: Date },
    partner: { type: Date },
    soulmate: { type: Date }
  },

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
