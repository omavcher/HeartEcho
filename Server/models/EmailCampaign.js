const mongoose = require("mongoose");

const emailCampaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  template: { type: mongoose.Schema.Types.ObjectId, ref: "EmailTemplate", required: true },
  status: { type: String, enum: ["draft", "scheduled", "sending", "completed", "paused", "failed"], default: "draft" },
  targetAudience: { 
    type: String, 
    enum: [
      "all", "free", "subscribers", 
      "new_users_today", "new_users_7d", 
      "free_today", "free_7d", 
      "subscribers_today", "subscribers_7d", 
      "free_no_chat", "free_chatted_no_sub", 
      "inactive_7d", "inactive_30d", 
      "specific_user"
    ], 
    default: "all" 
  },
  targetValue: { type: String },
  scheduledAt: { type: Date, default: Date.now },
  totalRecipients: { type: Number, default: 0 },
  sentCount: { type: Number, default: 0 },
  openCount: { type: Number, default: 0 },
  clickCount: { type: Number, default: 0 },
  conversionCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("EmailCampaign", emailCampaignSchema);
