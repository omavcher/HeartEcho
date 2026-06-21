const mongoose = require('mongoose');

const userWithdrawalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 500
  },
  method: {
    type: String,
    enum: ['upi', 'bank'],
    required: true
  },
  details: {
    upiId: { type: String },
    accountNo: { type: String },
    ifsc: { type: String },
    bankName: { type: String },
    holderName: { type: String }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  processedAt: {
    type: Date
  },
  errorMessage: {
    type: String
  }
}, {
  timestamps: true
});

userWithdrawalSchema.index({ user: 1 });
userWithdrawalSchema.index({ status: 1 });

module.exports = mongoose.model('UserWithdrawal', userWithdrawalSchema);
