const mongoose = require('mongoose');

const userReferralSchema = new mongoose.Schema({
  referrer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  referredUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  stage: {
    type: Number,
    enum: [1, 2, 3],
    default: 1
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'premium', 'invalid'],
    default: 'pending'
  },
  signupRewardClaimed: {
    type: Boolean,
    default: false
  },
  activeRewardClaimed: {
    type: Boolean,
    default: false
  },
  subscriptionPurchased: {
    type: Boolean,
    default: false
  },
  commissionClaimed: {
    type: Boolean,
    default: false
  },
  signupRewardAmount: {
    type: Number,
    default: 2
  },
  activeRewardAmount: {
    type: Number,
    default: 3
  },
  subscriptionCommissionAmount: {
    type: Number,
    default: 0
  },
  referredUserMessagesCount: {
    type: Number,
    default: 0
  },
  ipAddress: {
    type: String
  },
  deviceId: {
    type: String
  },
  invalidReason: {
    type: String
  }
}, {
  timestamps: true
});

// Enforce unique pairs of referrer & referred user
userReferralSchema.index({ referrer: 1, referredUser: 1 }, { unique: true });
userReferralSchema.index({ referredUser: 1 });
userReferralSchema.index({ status: 1 });

module.exports = mongoose.model('UserReferral', userReferralSchema);
