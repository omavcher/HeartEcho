const mongoose = require("mongoose");

const emailQueueSchema = new mongoose.Schema({
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: "EmailCampaign", required: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  toEmail: { type: String, required: true },
  subject: { type: String, required: true },
  html: { type: String, required: true },
  status: { type: String, enum: ["pending", "sending", "sent", "failed", "paused_followup"], default: "pending" },
  smtpCredential: { type: mongoose.Schema.Types.ObjectId, ref: "SmtpCredential", required: false },
  followUp: { type: mongoose.Schema.Types.ObjectId, ref: "FollowUpSequence", required: false },
  error: { type: String, default: "" },
  trackingId: { type: String, required: true, unique: true }, // For click/open mapping
  sentAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model("EmailQueue", emailQueueSchema);
