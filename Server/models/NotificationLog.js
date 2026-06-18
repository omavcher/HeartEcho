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
  ],

  // Auto notification link
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "AutoCampaign", default: null },

  // Conversion tracking (premium conversions)
  conversionsCount: { type: Number, default: 0 },
  conversions: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      convertedAt: { type: Date, default: Date.now },
      planType: { type: String },
      amount: { type: Number }
    }
  ]
}, { timestamps: true });

const NotificationLog = mongoose.model("NotificationLog", notificationLogSchema);
module.exports = NotificationLog;
