const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  aiParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: "AIFriend" }],
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, refPath: "senderModel" },
      senderModel: { type: String, enum: ["User", "AIFriend", "PrebuiltAIFriend"] }, // ✅ FIXED
      text: String,
      time: { type: Date, default: Date.now },
      reactions: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          emoji: String,
        },
      ],
    },
  ],
});


module.exports = mongoose.model("Chat", chatSchema);
