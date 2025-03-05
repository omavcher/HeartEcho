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
  selectedInterests: [{ type: String }],

  // New Fields for Subscription Management
  joinedAt: { type: Date, default: Date.now }, // Track account creation date
  subscriptionExpiry: { type: Date, default: null }, // Null means no expiry (for lifetime access)
  
  // New Fields for Free Message Quota
  messageQuota: { type: Number, default: 20 }, // Default free messages per day
  lastQuotaReset: { type: Date, default: Date.now }, // Track last reset date

  // References to Other Models
  payment_history: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payment" }],
  login_details: [{ type: mongoose.Schema.Types.ObjectId, ref: "LoginDetail" }],
  tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ticket" }],
  chats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
  ai_friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "AIFriend" }]
});

// Method to reset message quota once per day (Only for free users)
userSchema.methods.resetMessageQuota = function () {
  const today = new Date();
  const lastReset = new Date(this.lastQuotaReset);

  if (
    today.getUTCFullYear() !== lastReset.getUTCFullYear() ||
    today.getUTCMonth() !== lastReset.getUTCMonth() ||
    today.getUTCDate() !== lastReset.getUTCDate()
  ) {
    if (this.user_type === "free") {
      this.messageQuota = 20; // Reset only for free users
    }
    this.lastQuotaReset = today;
  }
};

// Method to check if a user’s subscription is valid
userSchema.methods.isSubscriptionActive = function () {
  if (!this.subscriptionExpiry) return false; // No expiry date set means no active subscription
  return new Date() <= this.subscriptionExpiry; // Check if the current date is before expiry
};

// Method to update subscription (monthly or yearly)
userSchema.methods.subscribe = function (durationType) {
  const now = new Date();

  if (durationType === "monthly") {
    now.setMonth(now.getMonth() + 1); // Add 1 month
  } else if (durationType === "yearly") {
    now.setFullYear(now.getFullYear() + 1); // Add 1 year
  } else if (durationType === "lifetime") {
    this.subscriptionExpiry = null; // Lifetime subscription (never expires)
    this.user_type = "subscriber";
    return;
  }

  this.subscriptionExpiry = now;
  this.user_type = "subscriber";
};

// Method to check and reset subscription if expired
userSchema.methods.checkSubscription = function () {
  if (this.subscriptionExpiry && new Date() > this.subscriptionExpiry) {
    this.user_type = "free"; // Revert user back to free if expired
    this.subscriptionExpiry = null; // Clear expiry date
  }
};

const User = mongoose.model("User", userSchema);
module.exports = User;
