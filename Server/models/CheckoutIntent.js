const mongoose = require("mongoose");

const checkoutIntentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  planName: {
    type: String,
    default: "Premium Plan"
  },
  platform: {
    type: String,
    enum: ["web", "mobile"],
    default: "web"
  },
  status: {
    type: String,
    enum: ["pending", "completed", "email_sent"],
    default: "pending"
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 172800 // TTL index: auto-delete documents after 48 hours
  }
});

module.exports = mongoose.model("CheckoutIntent", checkoutIntentSchema);
