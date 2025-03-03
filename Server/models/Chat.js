const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // ✅ Changed from participant
  aiParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: "AIFriend" }], // ✅ Renamed to plural
  
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, refPath: "senderModel" }, 
      senderModel: { type: String, enum: ["User", "AIFriend"] }, 
      text: String,
      time: { type: Date, default: Date.now },
    },
  ],
});

module.exports = mongoose.model("Chat", chatSchema);
