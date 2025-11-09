const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const referralCreatorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['instagram', 'youtube', 'tiktok', 'twitter', 'facebook', 'other'],
    default: 'instagram'
  },
  username: {
    type: String,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  referralId: {
    type: String,
    unique: true,
    trim: true
  },
  commissionRate: {
    type: Number,
    required: true,
    min: 1,
    max: 50,
    default: 15
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  referralCount: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  pendingEarnings: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  payouts: [{
    amount: Number,
    date: Date,
    status: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending'
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
referralCreatorSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  
  if (this.isNew || this.isModified('username')) {
    this.referralId = await generateUniqueReferralId(this.username);
  }
  next();
});

// Method to compare password
referralCreatorSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate referral ID function (your existing code)
async function generateUniqueReferralId(username) {
  let referralId;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 5;

  while (!isUnique && attempts < maxAttempts) {
    const usernamePart = username.substring(0, 4).toLowerCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const endPart = username.length >= 3 
      ? username.substring(username.length - 3).toLowerCase()
      : username.padEnd(3, 'x').toLowerCase();
    
    referralId = `${usernamePart}_${randomNum}_${endPart}`;
    
    const existingCreator = await mongoose.model('ReferralCreator').findOne({ referralId });
    if (!existingCreator) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    const timestamp = Date.now().toString().slice(-4);
    referralId = `${username.substring(0, 4).toLowerCase()}_${timestamp}_${username.substring(username.length - 3).toLowerCase()}`;
  }

  return referralId;
}

// Indexes
referralCreatorSchema.index({ platform: 1, username: 1 }, { unique: true });
referralCreatorSchema.index({ referralId: 1 }, { unique: true });
referralCreatorSchema.index({ isActive: 1 });
referralCreatorSchema.index({ referralCount: -1 });

module.exports = mongoose.model('ReferralCreator', referralCreatorSchema);