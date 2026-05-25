const mongoose = require("mongoose");

const emailCampaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  template: { type: mongoose.Schema.Types.ObjectId, ref: "EmailTemplate", required: true },
  status: { type: String, enum: ["draft", "scheduled", "sending", "completed", "paused", "failed"], default: "draft" },
  targetAudience: { type: String, enum: ["all", "free", "subscribers", "inactive_7d", "inactive_30d"], default: "all" },
  scheduledAt: { type: Date, default: Date.now },
  totalRecipients: { type: Number, default: 0 },
  sentCount: { type: Number, default: 0 },
  openCount: { type: Number, default: 0 },
  clickCount: { type: Number, default: 0 },
  conversionCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("EmailCampaign", emailCampaignSchema);
