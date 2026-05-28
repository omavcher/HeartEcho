const mongoose = require("mongoose");

const emailTrackingLogSchema = new mongoose.Schema({
  trackingId: { type: String, required: true }, // Ties to EmailQueue trackingId
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: "EmailCampaign", required: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  email: { type: String, required: true },
  action: { type: String, enum: ["open", "click", "conversion"], required: true },
  ip: { type: String },
  userAgent: { type: String },
  clickedUrl: { type: String }, // Present if action is 'click'
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for quick queries
emailTrackingLogSchema.index({ trackingId: 1, action: 1 });
emailTrackingLogSchema.index({ user: 1, action: 1 });

module.exports = mongoose.model("EmailTrackingLog", emailTrackingLogSchema);
