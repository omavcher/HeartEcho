const mongoose = require("mongoose");

const trackingSummarySchema = new mongoose.Schema({
  dateCreated: { type: Date, default: Date.now },
  periodStart: { type: Date },
  periodEnd: { type: Date },
  totalEventsOptimized: { type: Number, default: 0 },
  uniqueSessions: { type: Number, default: 0 },
  eventCounts: { type: mongoose.Schema.Types.Mixed }, // e.g., { page_view: 500, click: 200 }
  notes: { type: String }
});

const TrackingSummary = mongoose.model("TrackingSummary", trackingSummarySchema);
module.exports = TrackingSummary;
