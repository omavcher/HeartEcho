const mongoose = require("mongoose");

const followUpSequenceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  parentCampaign: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "EmailCampaign", 
    required: true 
  },
  template: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "EmailTemplate", 
    required: true 
  },
  triggerCondition: {
    type: String,
    enum: ["opened", "clicked", "not_opened", "not_clicked", "not_converted"],
    required: true
  },
  delayHours: { type: Number, default: 48, min: 0 },
  subjectOverride: { type: String, default: "" },
  status: {
    type: String,
    enum: ["active", "paused", "completed"],
    default: "active"
  },
  totalTargeted: { type: Number, default: 0 },
  sentCount: { type: Number, default: 0 },
  openCount: { type: Number, default: 0 },
  clickCount: { type: Number, default: 0 },
  conversionCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model("FollowUpSequence", followUpSequenceSchema);
