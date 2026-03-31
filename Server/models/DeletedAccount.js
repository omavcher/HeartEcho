const mongoose = require("mongoose");

const DeletedAccountSchema = new mongoose.Schema({
  // Original user details
  originalUserId: { type: String, required: true },
  name: { type: String },
  email: { type: String, required: true },
  phone_number: { type: String },
  gender: { type: String },
  age: { type: Number },
  user_type: { type: String },
  subscriptionTier: { type: String },
  subscriptionExpiry: { type: Date },
  joinedAt: { type: Date },

  // Snapshot of related data counts (for analytics)
  stats: {
    totalChats: { type: Number, default: 0 },
    totalMessages: { type: Number, default: 0 },
    totalPayments: { type: Number, default: 0 },
    totalTickets: { type: Number, default: 0 },
    totalAIFriends: { type: Number, default: 0 },
  },

  // Last payment record (for potential refund / audit)
  lastPayment: {
    amount: Number,
    transaction_id: String,
    date: Date,
  },

  // Meta
  deletedAt: { type: Date, default: Date.now },
  ip: { type: String }, // IP at time of deletion if available
});

module.exports = mongoose.model("DeletedAccount", DeletedAccountSchema);
