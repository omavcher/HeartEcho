const mongoose = require("mongoose");

const guestChatSchema = new mongoose.Schema({
  guestId: { type: String, required: true },
  aiParticipants: { type: mongoose.Schema.Types.ObjectId, refPath: "aiModelType" },
  aiModelType: {
    type: String,
    enum: ["AIFriend", "PrebuiltAIFriend"]
  },
  
  messages: [
    {
      sender: { type: String, enum: ["guest", "ai"] },
      text: String,
      time: { type: Date, default: Date.now },
      mediaType: {
        type: String,
        enum: ["text", "image", "video", "audio"],
        default: "text"
      }
    }
  ],
  
  messageCount: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

guestChatSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("GuestChat", guestChatSchema);
