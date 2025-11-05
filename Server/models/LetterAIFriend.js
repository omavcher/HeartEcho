const mongoose = require('mongoose');

const LetterAIFriendSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  gender: { type: String, enum: ["male", "female", "other"], required: true },
  relationship: { type: String, required: true },
  interests: [{ type: String }],
  age: { type: String, enum: ["Teen", "Young", "Mature", "Old"], required: true },
  name: { type: String, required: true },
  description: { type: String },
  settings: { type: Object },
  initial_message: { type: String },
  avatar_img: { type: String },
  address: { type: String },
  city: { type: String },
  personality_traits: [{ type: String }],
  favorite_topics: [{ type: String }],
  writing_style: { type: String },
  signature_style: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LetterAIFriend', LetterAIFriendSchema);