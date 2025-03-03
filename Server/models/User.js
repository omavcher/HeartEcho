const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  profile_picture: { type: String, default: "" },
  name: { type: String },
  email: { type: String, required: true, unique: true },
  phone_number: { type: String },
  gender: { type: String, enum: ["male", "female", "Other"] },
  birth_date: { type: Date },
  age: { type: Number },
  password: { type: String, required: true },
  interests: [{ type: String }],
  user_type: { type: String, enum: ["free", "subscriber"], default: "free" },
  twofactor: { type: Boolean, default: false },
  referralCode: { type: String },
  termsAccepted: { type: Boolean, default: false },
  subscribeNews: { type: Boolean, default: false },
  selectedInterests:[{type: String}],

  // New Fields for Free Message Quota
  joinedAt: { type: Date, default: Date.now }, // Track account creation date
  messageQuota: { type: Number, default: 10 }, // Default free messages per day

  // References to Other Models
  payment_history: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payment" }],
  login_details: [{ type: mongoose.Schema.Types.ObjectId, ref: "LoginDetail" }],
  tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ticket" }],
  chats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
  ai_friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "AIFriend" }]
});

// Method to check if the user still qualifies for free daily messages
userSchema.methods.resetMessageQuota = function () {
  const today = new Date();
  const joinedAt = new Date(this.joinedAt);
  const daysSinceJoined = Math.floor((today - joinedAt) / (1000 * 60 * 60 * 24)); 

  if (daysSinceJoined < 7) {
    this.messageQuota = 10; // Reset free messages for the day
  } else if (this.user_type === "free") {
    this.messageQuota = 0; // Free users lose daily quota after 7 days
  }
};

const User = mongoose.model("User", userSchema);
module.exports = User;
