const mongoose = require("mongoose");

const emailTemplateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., 'welcome', 'followup24', 'newpersona'
  label: { type: String, required: true }, // e.g., 'Welcome Email', '24hr Follow-up'
  subject: { type: String, required: true },
  html: { type: String, required: true }, // Customizable HTML body
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("EmailTemplate", emailTemplateSchema);
