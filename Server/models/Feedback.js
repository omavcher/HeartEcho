const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  city: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5 },
  feature: { type: String },
  text: { type: String, required: true },
  isConcern: { type: Boolean, default: false },
  live: { type: Boolean, default: false },
  date: { type: Date, default: Date.now }
});

const Feedback = mongoose.model("Feedback", FeedbackSchema);
module.exports = Feedback;
