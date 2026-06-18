const mongoose = require("mongoose");

const autoCampaignSchema = new mongoose.Schema({
  campaignType: {
    type: String,
    required: true,
    unique: true,
    enum: [
      "welcome_1",          // Day 1
      "welcome_2",          // Day 2
      "welcome_3",          // Day 3
      "daily_morning",      // Daily 8-10 AM
      "daily_afternoon",    // Daily 1-3 PM
      "daily_evening",      // Daily 7-10 PM
      "daily_night",        // Daily 11 PM
      "inactive_3d",        // 3 days inactive
      "inactive_7d",        // 7 days inactive
      "premium_upsell",     // Premium upsell
      "weekend_special",    // Weekend
      "festival_greeting",  // Custom
      "trigger_signup_no_msg",      // Real-time: Signup but no message (3-4 mins)
      "trigger_inactive_after_msg"  // Real-time: Message sent but abandoned (3-4 mins)
    ]
  },
  title: { type: String, required: true },
  body: { type: String, required: true },
  imageUrl: { type: String, default: "" },
  isActive: { type: Boolean, default: true },
  scheduledHour: { type: Number, default: 9 }, // Hour of the day in IST (0-23)
  aiEnabled: { type: Boolean, default: true },
  promptTemplate: { type: String, default: "" }
}, { timestamps: true });

const AutoCampaign = mongoose.model("AutoCampaign", autoCampaignSchema);
module.exports = AutoCampaign;
