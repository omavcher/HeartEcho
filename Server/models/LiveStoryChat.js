const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ["me", "ai"], required: true },
  text: { type: String, required: true },
  time: { type: Date, default: Date.now },
  mediaType: { type: String, default: "text" },
});

const liveStoryChatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  storySlug: { type: String, required: true }, // Links to LiveStoryModel and frontend data
  messages: [messageSchema]
}, { timestamps: true });

// A user has one chat history per story
liveStoryChatSchema.index({ userId: 1, storySlug: 1 }, { unique: true });

module.exports = mongoose.model("LiveStoryChat", liveStoryChatSchema);
