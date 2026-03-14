const mongoose = require("mongoose");

const liveStoryModelSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true }, // Matches the slug from frontend liveStoriesData
  title: { type: String, required: true },
  storyInText: { type: String }, // General description or instructions
  role: { type: String }, // Role of the AI in the story
  setting: { type: String }, // Setting of the story
  instruction: { type: String }, // Specific prompt instructions for OpenRouter
}, { timestamps: true });

module.exports = mongoose.model("LiveStoryModel", liveStoryModelSchema);
