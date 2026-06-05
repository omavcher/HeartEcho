const mongoose = require("mongoose");

const voiceWaitlistSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    trim: true, 
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  createdAt: { type: Date, default: Date.now }
});

const VoiceWaitlist = mongoose.model("VoiceWaitlist", voiceWaitlistSchema);
module.exports = VoiceWaitlist;
