const mongoose = require("mongoose");

const userAIFriendSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true }, // User ObjectId or guest session ID
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  gender: { type: String, enum: ["male", "female", "other"], required: true },
  relationship: { type: String, required: true },
  interests: [{ type: String }],
  age: { type: Number, default: 22 },
  name: { type: String, required: true },
  nickname: { type: String },
  description: { type: String },
  settings: { type: Object },
  initial_message: { type: String },
  avatar_img: { type: String },
  img_gallery: [{ type: String }], // Cloudflare R2 CDN links of generated photos
  isPrivate: { type: Boolean, default: true }, // Only accessible by created user
  createdAt: { type: Date, default: Date.now }
});

const UserAIFriend = mongoose.model("UserAIFriend", userAIFriendSchema);
module.exports = UserAIFriend;
