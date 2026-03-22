const mongoose = require('mongoose');

const AiLiveSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  tag: { type: String },
  age: { type: Number },
  gender: { type: String, default: 'female' },
  avatar: { type: String },
  idleVideos: [{ type: String }],
  actionVideos: {
    wave: [{ type: String }],
    dance: [{ type: String }],
    naughty: [{ type: String }],
    kiss: [{ type: String }],
    pose: [{ type: String }],
    hot_show: [{ type: String }]
  }
}, { timestamps: true });

module.exports = mongoose.model('AiLive', AiLiveSchema);
