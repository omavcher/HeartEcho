const mongoose = require("mongoose");

const prebuiltAIFriendSchema = new mongoose.Schema({
  gender: { type: String, enum: ["male", "female", "other"], required: true },
  relationship: { type: String, required: true },
  interests: [{ type: String }],
  age: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String },
  settings: { type: Object },
  initial_message: { type: String },
  avatar_img: { type: String },
  avatar_motion_video: { type: String }, // Added avatar motion video
  img_gallery: [{ type: String }], // Multiple images array
  video_gallery: [{ type: String }] // Multiple videos array
});

const PrebuiltAIFriend = mongoose.model("PrebuiltAIFriend", prebuiltAIFriendSchema);
module.exports = PrebuiltAIFriend;