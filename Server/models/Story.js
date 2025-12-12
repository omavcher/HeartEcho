const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a story title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  slug: {
    type: String,
    required: [true, 'Please provide a slug'],
    unique: true,
    lowercase: true,
    trim: true
  },
  excerpt: {
    type: String,
    required: [true, 'Please provide an excerpt'],
    maxlength: [500, 'Excerpt cannot be more than 500 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please provide a category']
  },
  city: {
    type: String,
    required: [true, 'Please provide a city'],
    enum: [
      'Mumbai',
      'Delhi',
      'Bangalore',
      'Hyderabad',
      'Chennai',
      'Kolkata',
      'Pune',
      'Ahmedabad',
      'Jaipur',
      'Lucknow',
      'Goa',
      'Chandigarh',
      'Other'
    ]
  },
  readCount: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  trending: {
    type: Boolean,
    default: false
  },
  characterId: {
    type: String
  },
  characterName: {
    type: String,
    required: [true, 'Please provide character name']
  },
  characterAge: {
    type: Number,
    required: [true, 'Please provide character age'],
    min: [18, 'Character must be at least 18 years old']
  },
  characterOccupation: {
    type: String,
    required: [true, 'Please provide character occupation']
  },
  characterPersonality: {
    type: String,
    maxlength: [500, 'Personality description cannot be more than 500 characters']
  },
  
  // Content
  content_en: {
    story: {
      type: String,
      required: [true, 'Please provide English story content']
    },
    cliffhanger: {
      type: String,
      required: [true, 'Please provide English cliffhanger']
    },
    teaserChat: {
      type: String,
      required: [true, 'Please provide English teaser chat']
    },
    cta: {
      type: String,
      default: 'Start Chat'
    }
  },
  
  content_hi: {
    story: {
      type: String,
      required: [true, 'Please provide Hindi story content']
    },
    cliffhanger: {
      type: String,
      required: [true, 'Please provide Hindi cliffhanger']
    },
    teaserChat: {
      type: String,
      required: [true, 'Please provide Hindi teaser chat']
    },
    cta: {
      type: String,
      default: 'चैट शुरू करें'
    }
  },
  
  // Media
  backgroundImage: {
    type: String,
    default: '/api/placeholder/1200/675'
  },
  characterAvatar: {
    type: String,
    default: '/api/placeholder/400/711'
  },
  
  // Metadata
  tags: [{
    type: String,
    trim: true
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create index for search
storySchema.index({ title: 'text', excerpt: 'text', 'characterName': 'text', city: 'text' });

// Slug generation middleware
storySchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  next();
});

// Update read count
storySchema.methods.incrementReadCount = function() {
  this.readCount += 1;
  return this.save();
};

const Story = mongoose.model('Story', storySchema);

module.exports = Story;