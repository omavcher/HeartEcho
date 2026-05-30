const mongoose = require("mongoose");

const appVersionSchema = new mongoose.Schema({
  latestVersion: { type: String, required: true, default: "1.0.3" },
  latestBuildNumber: { type: Number, required: true, default: 6 },
  playStoreUrl: { type: String, required: true, default: "https://play.google.com/store/apps/details?id=com.heartecho.ai" }
}, { timestamps: true });

module.exports = mongoose.model("AppVersion", appVersionSchema);
