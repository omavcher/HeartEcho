// models/User.js - Updated version
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

  // Subscription Management
  joinedAt: { type: Date, default: Date.now },
  subscriptionExpiry: { type: Date, default: null },
  
  // Message quota system
  messageQuota: { type: Number, default: 20 },
  lastQuotaReset: { type: Date, default: Date.now },
  messagesUsedToday: { type: Number, default: 0 }, // Track daily usage

  // Referral System
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReferralCreator',
    default: null
  },
  referralSignupDate: { type: Date, default: null },
  hasUsedReferral: { type: Boolean, default: false },

  payment_history: [{ type: mongoose.Schema.Types.ObjectId, ref: "Payment" }],
  login_details: [{ type: mongoose.Schema.Types.ObjectId, ref: "LoginDetail" }],
  tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Ticket" }],
  chats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
  ai_friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "AIFriend" }]
}, {
  timestamps: true
});

// Method to check and reset daily quota
userSchema.methods.resetDailyQuota = function () {
  const now = new Date();
  const lastReset = new Date(this.lastQuotaReset);
  
  // Check if it's a new day (comparing year, month, day)
  if (now.toDateString() !== lastReset.toDateString()) {
    this.messagesUsedToday = 0;
    this.lastQuotaReset = now;
    return true;
  }
  return false;
};

// Method to check if user can send message
userSchema.methods.canSendMessage = function (cost = 1) {
  this.resetDailyQuota(); // Reset quota if new day
  
  if (this.isSubscriptionActive()) {
    return true; // Subscribers have unlimited access
  }
  
  return (this.messagesUsedToday + cost) <= this.messageQuota;
};

// Method to deduct message quota
userSchema.methods.deductMessageQuota = function (cost = 1) {
  if (!this.isSubscriptionActive()) {
    this.messagesUsedToday += cost;
  }
  return this.save();
};

// Method to check if subscription is active
userSchema.methods.isSubscriptionActive = function () {
  // If no expiry date, check user_type
  if (!this.subscriptionExpiry) {
    return this.user_type === "subscriber";
  }
  return new Date() <= this.subscriptionExpiry;
};

// Method to get remaining quota
userSchema.methods.getRemainingQuota = function () {
  this.resetDailyQuota(); // Ensure quota is reset if needed
  if (this.isSubscriptionActive()) {
    return 999; // Unlimited for subscribers
  }
  return Math.max(0, this.messageQuota - this.messagesUsedToday);
};

// Method to update subscription
userSchema.methods.updateSubscription = function (durationType) {
  const now = new Date();
  let newExpiry = new Date(now);

  if (this.subscriptionExpiry && this.subscriptionExpiry > now) {
    newExpiry = new Date(this.subscriptionExpiry); // Extend from current expiry
  }

  if (durationType === "monthly") {
    newExpiry.setMonth(newExpiry.getMonth() + 1);
  } else if (durationType === "yearly") {
    newExpiry.setFullYear(newExpiry.getFullYear() + 1);
  } else if (durationType === "lifetime") {
    this.subscriptionExpiry = null; // Never expires
    this.user_type = "subscriber";
    return this.save();
  }

  this.subscriptionExpiry = newExpiry;
  this.user_type = "subscriber";
  return this.save();
};

// Static method to check and update expired subscriptions
userSchema.statics.checkExpiredSubscriptions = async function () {
  const now = new Date();
  const result = await this.updateMany(
    {
      user_type: "subscriber",
      subscriptionExpiry: { $lte: now }
    },
    {
      $set: { 
        user_type: "free",
        subscriptionExpiry: null
      }
    }
  );
  return result;
};

const User = mongoose.model("User", userSchema);
module.exports = User;