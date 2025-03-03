const mongoose = require("mongoose");

const aiFriendSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  gender: { type: String, enum: ["male", "female", "other"], required: true },
  relationship: { type: String, required: true },
  interests: [{ type: String }],
  age: { type: String, enum: ["Teen", "Young", "Mature", "Old"], required: true },
  name: { type: String, required: true },
  description: { type: String },
  settings: { type: Object },
  initial_message: { type: String },
  avatar_img: { type: String }
});

const AIFriend = mongoose.model("AIFriend", aiFriendSchema);
module.exports = AIFriend;
