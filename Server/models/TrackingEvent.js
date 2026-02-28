const mongoose = require("mongoose");

const trackingEventSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  sessionId: { type: String, required: true },
  eventType: { type: String, required: true }, // e.g., 'page_view', 'click', 'scroll', 'form_submit', 'conversion', 'time_spent'
  path: { type: String, required: true },
  eventData: { type: mongoose.Schema.Types.Mixed }, // Arbitrary data related to the event (e.g., buttonId, timeSpent, etc.)
  url: { type: String },
  userAgent: { type: String },
  referrer: { type: String },
  deviceType: { type: String },
  ip: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const TrackingEvent = mongoose.model("TrackingEvent", trackingEventSchema);
module.exports = TrackingEvent;
