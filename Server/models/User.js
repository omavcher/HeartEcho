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
  messageQuota: { 
    type: Number, 
    default: 5,
    min: 0,
    max: 999
  },
  lastQuotaReset: { 
    type: Date, 
    default: Date.now 
  },
  messagesUsedToday: { 
    type: Number, 
    default: 0,
    min: 0 
  },

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

// Pre-save middleware to ensure quota consistency
userSchema.pre('save', function(next) {
  // Ensure free users always have messageQuota of 5
  if (this.user_type === 'free' && this.messageQuota !== 5) {
    this.messageQuota = 5;
  }
  
  // Ensure subscribers have high quota
  if (this.user_type === 'subscriber' && this.messageQuota < 999) {
    this.messageQuota = 999;
  }
  
  // Ensure messagesUsedToday doesn't exceed quota
  if (this.messagesUsedToday > this.messageQuota) {
    this.messagesUsedToday = this.messageQuota;
  }
  
  next();
});

// Method to check and reset daily quota
userSchema.methods.resetDailyQuota = function () {
  const now = new Date();
  const lastReset = this.lastQuotaReset ? new Date(this.lastQuotaReset) : new Date(0);
  
  // Convert to IST for day comparison
  const nowIST = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const lastResetIST = new Date(lastReset.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  
  // Check if it's a new day in IST
  const today = new Date(nowIST.getFullYear(), nowIST.getMonth(), nowIST.getDate());
  const lastResetDate = new Date(lastResetIST.getFullYear(), lastResetIST.getMonth(), lastResetIST.getDate());
  
  if (lastResetDate < today) {
    this.messagesUsedToday = 0;
    this.lastQuotaReset = now;
    
    // Ensure free users have 20 messages
    if (this.user_type === 'free') {
      this.messageQuota = 5;
    }
    
    console.log(`[User ${this.email}] Quota reset. New day detected.`);
    return true;
  }
  
  return false;
};

// Method to check if user can send message
userSchema.methods.canSendMessage = function (cost = 1) {
  // Always reset quota if needed
  this.resetDailyQuota();
  
  if (this.isSubscriptionActive()) {
    return true; // Subscribers have unlimited access
  }
  
  // For free users, check quota
  const remaining = this.messageQuota - this.messagesUsedToday;
  return remaining >= cost;
};

// Method to deduct message quota
userSchema.methods.deductMessageQuota = async function (cost = 1) {
  if (!this.isSubscriptionActive()) {
    this.messagesUsedToday += cost;
    
    // Ensure we don't go negative
    if (this.messagesUsedToday > this.messageQuota) {
      this.messagesUsedToday = this.messageQuota;
    }
    
    console.log(`[User ${this.email}] Deducted ${cost} message(s). Used: ${this.messagesUsedToday}/${this.messageQuota}`);
  } else {
    console.log(`[User ${this.email}] Subscriber - no quota deduction`);
  }
  
  return await this.save();
};

// Method to check if subscription is active
userSchema.methods.isSubscriptionActive = function () {
  // First check user_type
  if (this.user_type !== "subscriber") {
    return false;
  }
  
  // If no expiry date, it's lifetime subscription
  if (!this.subscriptionExpiry) {
    return true;
  }
  
  // Check if expiry date is in future
  return new Date() <= new Date(this.subscriptionExpiry);
};

// Method to get remaining quota
userSchema.methods.getRemainingQuota = function () {
  this.resetDailyQuota(); // Ensure quota is reset if needed
  
  if (this.isSubscriptionActive()) {
    return 999; // Unlimited for subscribers
  }
  
  return Math.max(0, this.messageQuota - this.messagesUsedToday);
};

// Method to get quota status
userSchema.methods.getQuotaStatus = function () {
  this.resetDailyQuota();
  
  return {
    userType: this.user_type,
    isSubscriber: this.isSubscriptionActive(),
    messagesUsedToday: this.messagesUsedToday,
    messageQuota: this.messageQuota,
    remainingQuota: this.getRemainingQuota(),
    lastReset: this.lastQuotaReset,
    nextReset: this.getNextResetTime(),
    percentageUsed: this.messageQuota > 0 ? Math.round((this.messagesUsedToday / this.messageQuota) * 100) : 0
  };
};

// Method to get next reset time
userSchema.methods.getNextResetTime = function () {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 5, 0, 0); // Next reset at 00:05
  
  return tomorrow;
};

// Method to update subscription
userSchema.methods.updateSubscription = async function (durationType) {
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
    this.messageQuota = 999;
    return await this.save();
  }

  this.subscriptionExpiry = newExpiry;
  this.user_type = "subscriber";
  this.messageQuota = 999;
  return await this.save();
};

// Static method to check and update expired subscriptions
userSchema.statics.checkExpiredSubscriptions = async function () {
  const now = new Date();
  
  console.log(`Checking for expired subscriptions at ${now.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`);
  
  // Find users with expired subscriptions
  const expiredUsers = await this.find({
    user_type: "subscriber",
    subscriptionExpiry: { $lte: now, $ne: null }
  });
  
  console.log(`Found ${expiredUsers.length} expired subscriptions`);
  
  // Update each user
  for (const user of expiredUsers) {
    console.log(`Downgrading user ${user.email} to free (subscription expired)`);
  }
  
  const result = await this.updateMany(
    {
      user_type: "subscriber",
      subscriptionExpiry: { $lte: now, $ne: null }
    },
    {
      $set: { 
        user_type: "free",
        subscriptionExpiry: null,
        messageQuota:5,
        messagesUsedToday: 0
      }
    }
  );
  
  return result;
};

// Static method to manually reset all free users
userSchema.statics.resetAllFreeUsersQuota = async function () {
  const result = await this.updateMany(
    { user_type: "free" },
    { 
      $set: { 
        messagesUsedToday: 0,
        lastQuotaReset: new Date(),
        messageQuota: 5
      }
    }
  );
  
  console.log(`Manual reset: ${result.modifiedCount} free users reset`);
  return result;
};

// Static method to get quota statistics
userSchema.statics.getQuotaStatistics = async function () {
  const stats = await this.aggregate([
    {
      $facet: {
        freeUsers: [
          { $match: { user_type: "free" } },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              totalMessagesUsed: { $sum: "$messagesUsedToday" },
              avgMessagesUsed: { $avg: "$messagesUsedToday" },
              maxMessagesUsed: { $max: "$messagesUsedToday" },
              needsReset: {
                $sum: {
                  $cond: [{
                    $lt: [
                      { $ifNull: ["$lastQuotaReset", new Date(0)] },
                      new Date(new Date().setHours(0,0,0,0))
                    ]
                  }, 1, 0]
                }
              }
            }
          }
        ],
        subscribers: [
          { $match: { user_type: "subscriber" } },
          { $group: { _id: null, count: { $sum: 1 } } }
        ],
        allUsers: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              byType: { $push: { type: "$user_type", email: "$email" } }
            }
          }
        ]
      }
    }
  ]);
  
  return stats[0] || {};
};

const User = mongoose.model("User", userSchema);
module.exports = User;