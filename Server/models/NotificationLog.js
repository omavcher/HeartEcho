const mongoose = require("mongoose");

const notificationLogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: { type: String, required: true },
  imageUrl: { type: String },
  target: { type: String, required: true },
  recipientsCount: { type: Number, default: 0 },
  sentAt: { type: Date, default: Date.now },
  
  // Tracking stats
  opensCount: { type: Number, default: 0 },
  uniqueOpens: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  
  // Individual user tracking (optional, for detailed analytics)
  clicks: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      clickedAt: { type: Date, default: Date.now },
      platform: { type: String }
    }
  ]
}, { timestamps: true });

const NotificationLog = mongoose.model("NotificationLog", notificationLogSchema);
module.exports = NotificationLog;
