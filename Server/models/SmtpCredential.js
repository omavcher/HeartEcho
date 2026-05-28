const mongoose = require("mongoose");

const smtpCredentialSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  pass: { type: String, required: true }, // Gmail App Password
  host: { type: String, default: "smtp.gmail.com" },
  port: { type: Number, default: 465 },
  secure: { type: Boolean, default: true },
  limitDaily: { type: Number, default: 100 }, // Safe limit to prevent bans
  emailsSentToday: { type: Number, default: 0 },
  lastSentAt: { type: Date, default: null },
  active: { type: Boolean, default: true },
  errorMessage: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("SmtpCredential", smtpCredentialSchema);
