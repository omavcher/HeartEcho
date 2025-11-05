const mongoose = require('mongoose');

const LetterSchema = new mongoose.Schema({
  aiFriendId: { 
    type: String, 
    required: [true, 'AI Friend ID is required'] 
  },
  letterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    default: () => new mongoose.Types.ObjectId() 
  },
  senderType: { 
    type: String, 
    enum: ['user', 'ai'], 
    required: true 
  },
  senderId: { 
    type: String, 
    required: true 
  },
  senderModel: { 
    type: String, 
    enum: ['User', 'PredefinedAIFriend'], 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  imageUrl: { 
    type: String, 
    default: 'no-image' 
  },
  cloudinaryId: { 
    type: String 
  },
  metadata: { 
    type: mongoose.Schema.Types.Mixed 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

const LetterBoxSchema = new mongoose.Schema({
  owner: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'User ID is required'],
    unique: true, // One letterbox per user
    index: true
  },
  letters: [LetterSchema],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

LetterBoxSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('LetterBox', LetterBoxSchema);