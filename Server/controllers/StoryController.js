const mongoose = require("mongoose");
const Story = require("../models/Story");
const PrebuiltAIFriend = require("../models/PrebuiltAIFriend");

// @desc    Get all female AI friends for character selection
// @route   GET /api/v1/stories/get-female-ai-friends
// @access  Public
exports.getFemaleAIFriends = async (req, res) => {
  try {
    // Get all PrebuiltAIFriend with gender female, select only specific fields
    const aiFriends = await PrebuiltAIFriend.find(
      { gender: "female" },
      "id avatar_img gender name age description"
    ).lean();

    // Transform data to match frontend format
    const transformedFriends = aiFriends.map(friend => ({
      id: friend._id.toString(),
      avatar_img: friend.avatar_img || '/api/placeholder/400/711',
      gender: friend.gender,
      name: friend.name,
      age: friend.age,
      description: friend.description || `${friend.name}, ${friend.age} years`
    }));

    res.status(200).json({
      success: true,
      count: transformedFriends.length,
      data: transformedFriends
    });
  } catch (error) {
    console.error("Error fetching AI friends:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching AI friends",
      error: error.message
    });
  }
};

// @desc    Create new story
// @route   POST /api/v1/stories
// @access  Public/Admin
exports.createNewStory = async (req, res) => {
  try {
    const {
      title,
      excerpt,
      description,
      category,
      city,
      featured = false,
      trending = false,
      characterId,
      characterName,
      characterAge,
      characterOccupation,
      characterPersonality,
      content_en,
      content_hi,
      backgroundImage,
      characterAvatar,
      tags = []
    } = req.body;

    // Validate required fields
    if (!title || !excerpt || !category || !city || !characterName || !characterAge || !characterOccupation) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields"
      });
    }

    // Validate content
    if (!content_en || !content_en.story || !content_en.cliffhanger || !content_en.teaserChat) {
      return res.status(400).json({
        success: false,
        message: "English content is required (story, cliffhanger, teaserChat)"
      });
    }

    // Generate SEO-friendly slug from title
    const generateSlug = (title) => {
      // Step 1: Define stop words to remove
      const stopWords = ['the', 'is', 'and', 'of', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'without', 'how', 'what', 'when', 'where', 'why'];
      
      // Step 2: Clean and split title
      const words = title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
        .split(/\s+/) // Split by whitespace
        .filter(word => word.length > 0); // Remove empty strings
      
      // Step 3: Remove stop words (but keep first word)
      const filteredWords = words.filter((word, index) => 
        index === 0 || !stopWords.includes(word)
      );
      
      // Step 4: Take first 3-5 words (optimized for SEO)
      const seoWords = filteredWords.slice(0, 5); // Max 5 words
      
      // Step 5: Join with hyphens and ensure length 30-60 chars
      let slug = seoWords.join('-');
      
      // If slug is too short (<30 chars), add category or city
      if (slug.length < 30 && seoWords.length < 5) {
        const additionalWords = [category, city]
          .filter(Boolean)
          .map(word => word.toLowerCase().replace(/[^a-zA-Z0-9]/g, ''))
          .filter(word => word.length > 0 && !slug.includes(word));
        
        for (const word of additionalWords) {
          if (slug.length < 60) {
            slug += '-' + word;
          }
        }
      }
      
      // Truncate if too long (>60 chars) but keep complete words
      if (slug.length > 60) {
        slug = slug.substring(0, 60);
        // Don't end with hyphen, find last complete word
        const lastHyphenIndex = slug.lastIndexOf('-');
        if (lastHyphenIndex > 40) { // Keep at least 40 chars
          slug = slug.substring(0, lastHyphenIndex);
        }
      }
      
      // Generate 5-character random string
      const generateRandomString = (length) => {
        const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
          result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
      };
      
      const randomSuffix = generateRandomString(5);
      
      let finalSlug = slug
        .replace(/-+/g, '-') // Remove multiple hyphens
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
      
      // Add random suffix to the end
      finalSlug = `${finalSlug}-${randomSuffix}`;
      
      return finalSlug;
    };

    // Generate slug with random suffix
    const slug = generateSlug(title);

    // Verify character exists if characterId is provided
    if (characterId) {
      const characterExists = await PrebuiltAIFriend.findById(characterId);
      if (!characterExists) {
        return res.status(404).json({
          success: false,
          message: "Character not found"
        });
      }
    }

    // Create new story
    const story = await Story.create({
      title,
      slug,
      excerpt,
      description: description || excerpt,
      category,
      city,
      featured,
      trending,
      characterId,
      characterName,
      characterAge,
      characterOccupation,
      characterPersonality: characterPersonality || `${characterName} is a ${characterOccupation} from ${city}`,
      content_en: {
        story: content_en.story,
        cliffhanger: content_en.cliffhanger,
        teaserChat: content_en.teaserChat,
        cta: content_en.cta || 'Start Chat'
      },
      content_hi: content_hi ? {
        story: content_hi.story || content_en.story,
        cliffhanger: content_hi.cliffhanger || content_en.cliffhanger,
        teaserChat: content_hi.teaserChat || content_en.teaserChat,
        cta: content_hi.cta || 'चैट शुरू करें'
      } : {
        story: content_en.story,
        cliffhanger: content_en.cliffhanger,
        teaserChat: content_en.teaserChat,
        cta: 'चैट शुरू करें'
      },
      backgroundImage: backgroundImage || '/api/placeholder/1200/675',
      characterAvatar: characterAvatar || '/api/placeholder/400/711',
      tags,
      readCount: 0
    });

    // If characterId exists, update the PrebuiltAIFriend with story reference
    if (characterId) {
      await PrebuiltAIFriend.findByIdAndUpdate(
        characterId,
        { $push: { stories: story._id } },
        { new: true }
      );
    }

    res.status(201).json({
      success: true,
      message: "Story created successfully",
      data: story
    });
  } catch (error) {
    console.error("Error creating story:", error);
    
    // Handle duplicate key error (now very unlikely with random suffix, but still possible)
    if (error.code === 11000) {
      // Regenerate with new random suffix and try again
      const retrySlug = async (title) => {
        const generateRandomString = (length) => {
          const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
          let result = '';
          for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
          }
          return result;
        };
        
        const words = title
          .toLowerCase()
          .replace(/[^a-zA-Z0-9\s]/g, '')
          .split(/\s+/)
          .filter(word => word.length > 0);
        
        const stopWords = ['the', 'is', 'and', 'of', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'without', 'how', 'what', 'when', 'where', 'why'];
        
        const filteredWords = words.filter((word, index) => 
          index === 0 || !stopWords.includes(word)
        );
        
        const seoWords = filteredWords.slice(0, 5);
        let slug = seoWords.join('-');
        
        // Clean the slug
        slug = slug
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        
        // Add new random suffix
        const randomSuffix = generateRandomString(5);
        return `${slug}-${randomSuffix}`;
      };
      
      try {
        // Update the story with new slug
        const newSlug = await retrySlug(req.body.title);
        
        // Create story with new slug
        const story = await Story.create({
          ...req.body,
          slug: newSlug,
          description: req.body.description || req.body.excerpt,
          characterPersonality: req.body.characterPersonality || `${req.body.characterName} is a ${req.body.characterOccupation} from ${req.body.city}`,
          content_en: {
            story: req.body.content_en.story,
            cliffhanger: req.body.content_en.cliffhanger,
            teaserChat: req.body.content_en.teaserChat,
            cta: req.body.content_en.cta || 'Start Chat'
          },
          content_hi: req.body.content_hi ? {
            story: req.body.content_hi.story || req.body.content_en.story,
            cliffhanger: req.body.content_hi.cliffhanger || req.body.content_en.cliffhanger,
            teaserChat: req.body.content_hi.teaserChat || req.body.content_en.teaserChat,
            cta: req.body.content_hi.cta || 'चैट शुरू करें'
          } : {
            story: req.body.content_en.story,
            cliffhanger: req.body.content_en.cliffhanger,
            teaserChat: req.body.content_en.teaserChat,
            cta: 'चैट शुरू करें'
          },
          backgroundImage: req.body.backgroundImage || '/api/placeholder/1200/675',
          characterAvatar: req.body.characterAvatar || '/api/placeholder/400/711',
          tags: req.body.tags || [],
          readCount: 0
        });
        
        // If characterId exists, update the PrebuiltAIFriend with story reference
        if (req.body.characterId) {
          await PrebuiltAIFriend.findByIdAndUpdate(
            req.body.characterId,
            { $push: { stories: story._id } },
            { new: true }
          );
        }
        
        return res.status(201).json({
          success: true,
          message: "Story created successfully (regenerated slug due to conflict)",
          data: story
        });
      } catch (retryError) {
        return res.status(400).json({
          success: false,
          message: "Duplicate field value entered, failed to regenerate unique slug",
          error: error.keyValue
        });
      }
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating story",
      error: error.message
    });
  }
};

// @desc    Get all stories with filters
// @route   GET /api/v1/stories
// @access  Public
exports.getAllStories = async (req, res) => {
  try {
    const {
      category,
      city,
      featured,
      trending,
      search,
      limit = 999,
      page = 1
    } = req.query;

    // Parse parameters with defaults
    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 30;
    const skip = (pageNumber - 1) * limitNumber;

    // Build query
    let query = {};

    if (category && category !== 'All' && category !== 'all') {
      query.category = category;
    }

    if (city && city !== 'All Cities' && city !== 'all') {
      query.city = city;
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (trending === 'true') {
      query.trending = true;
    }

    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { excerpt: { $regex: search.trim(), $options: 'i' } },
        { characterName: { $regex: search.trim(), $options: 'i' } },
        { city: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    // Get total count
    const total = await Story.countDocuments(query);

    // Build base query for stories
    let storiesQuery = Story.find(query)
      .select('-content_en.story -content_hi.story')
      .skip(skip)
      .limit(limitNumber);

    // Apply sorting: First page gets special treatment
    if (pageNumber === 1 && !search && !category && !city) {
      // First page: Get 5 newest, then random
      const newestStories = await Story.find(query)
        .sort({ createdAt: -1 })
        .limit(5)
        .select('-content_en.story -content_hi.story')
        .lean();

      const newestIds = newestStories.map(story => story._id);
      
      // Get random stories excluding newest ones
      const randomStories = await Story.aggregate([
        { $match: { ...query, _id: { $nin: newestIds } } },
        { $sample: { size: limitNumber - newestStories.length } },
        { $project: { 
          content_en: { story: 0 },
          content_hi: { story: 0 }
        }}
      ]);

      const stories = [...newestStories, ...randomStories];
      
      // Get featured stories
      const featuredStories = await Story.find({ featured: true })
        .limit(4)
        .select('-content_en.story -content_hi.story')
        .lean();

      return res.json({
        success: true,
        count: stories.length,
        total,
        totalPages: Math.ceil(total / limitNumber),
        currentPage: pageNumber,
        data: stories,
        featured: featuredStories,
        hasRecentStories: newestStories.length > 0
      });
    } else {
      // Other pages: Just use createdAt sort
      storiesQuery = storiesQuery.sort({ createdAt: -1 });
      const stories = await storiesQuery.lean();

      // Get featured stories only for first page
      let featuredStories = [];
      if (pageNumber === 1) {
        featuredStories = await Story.find({ featured: true })
          .limit(4)
          .select('-content_en.story -content_hi.story')
          .lean();
      }

      return res.json({
        success: true,
        count: stories.length,
        total,
        totalPages: Math.ceil(total / limitNumber),
        currentPage: pageNumber,
        data: stories,
        featured: featuredStories,
        hasRecentStories: false
      });
    }

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching stories",
      error: error.message
    });
  }
};

// @desc    Get single story by ID or slug
// @route   GET /api/v1/stories/:id
// @access  Public
exports.getStoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    let story;
    
    // Check if it's a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      story = await Story.findById(id);
    }
    
    // If not found by ID, try by slug
    if (!story) {
      story = await Story.findOne({ slug: id });
    }
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found"
      });
    }
    
    // Increment read count
    await story.incrementReadCount();
    
    res.status(200).json({
      success: true,
      data: story
    });
  } catch (error) {
    console.error("Error fetching story:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching story",
      error: error.message
    });
  }
};

// @desc    Delete story
// @route   DELETE /api/v1/stories/:id
// @access  Public/Admin
exports.deleteStory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find story
    const story = await Story.findById(id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found"
      });
    }
    
    // Remove story from PrebuiltAIFriend if characterId exists
    if (story.characterId) {
      await PrebuiltAIFriend.findByIdAndUpdate(
        story.characterId,
        { $pull: { stories: story._id } }
      );
    }
    
    // Delete the story
    await story.deleteOne();
    
    res.status(200).json({
      success: true,
      message: "Story deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting story:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting story",
      error: error.message
    });
  }
};

// @desc    Update story
// @route   PUT /api/v1/stories/:id
// @access  Public/Admin
exports.updateStory = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Find story
    const story = await Story.findById(id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found"
      });
    }
    
    // If title is being updated, generate new slug
    if (updateData.title && updateData.title !== story.title) {
      const newSlug = updateData.title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
      // Check if new slug already exists
      const existingStory = await Story.findOne({ 
        slug: newSlug, 
        _id: { $ne: id } 
      });
      
      if (existingStory) {
        return res.status(400).json({
          success: false,
          message: "Another story with this title already exists"
        });
      }
      
      updateData.slug = newSlug;
    }
    
    // Update story
    const updatedStory = await Story.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    
    // If characterId is changed, update PrebuiltAIFriend references
    if (updateData.characterId && updateData.characterId !== story.characterId) {
      // Remove from old character
      if (story.characterId) {
        await PrebuiltAIFriend.findByIdAndUpdate(
          story.characterId,
          { $pull: { stories: story._id } }
        );
      }
      
      // Add to new character
      await PrebuiltAIFriend.findByIdAndUpdate(
        updateData.characterId,
        { $push: { stories: story._id } }
      );
    }
    
    res.status(200).json({
      success: true,
      message: "Story updated successfully",
      data: updatedStory
    });
  } catch (error) {
    console.error("Error updating story:", error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate field value entered",
        error: error.keyValue
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: "Error updating story",
      error: error.message
    });
  }
};

// @desc    Get featured stories
// @route   GET /api/v1/stories/featured
// @access  Public
exports.getFeaturedStories = async (req, res) => {
  try {
    const stories = await Story.find({ featured: true })
      .sort({ readCount: -1, createdAt: -1 })
      .limit(10)
      .select('title slug excerpt category city characterName characterAge readCount backgroundImage characterAvatar');
    
    res.status(200).json({
      success: true,
      count: stories.length,
      data: stories
    });
  } catch (error) {
    console.error("Error fetching featured stories:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching featured stories",
      error: error.message
    });
  }
};

// @desc    Get trending stories
// @route   GET /api/v1/stories/trending
// @access  Public
exports.getTrendingStories = async (req, res) => {
  try {
    const stories = await Story.find({ trending: true })
      .sort({ readCount: -1, createdAt: -1 })
      .limit(10)
      .select('title slug excerpt category city characterName characterAge readCount backgroundImage characterAvatar');
    
    res.status(200).json({
      success: true,
      count: stories.length,
      data: stories
    });
  } catch (error) {
    console.error("Error fetching trending stories:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching trending stories",
      error: error.message
    });
  }
};

// @desc    Get stories by city
// @route   GET /api/v1/stories/city/:city
// @access  Public
exports.getStoriesByCity = async (req, res) => {
  try {
    const { city } = req.params;
    
    const stories = await Story.find({ city })
      .sort({ readCount: -1 })
      .select('title slug excerpt category city characterName characterAge readCount backgroundImage characterAvatar');
    
    res.status(200).json({
      success: true,
      count: stories.length,
      data: stories
    });
  } catch (error) {
    console.error("Error fetching stories by city:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching stories by city",
      error: error.message
    });
  }
};

// @desc    Get stories by category
// @route   GET /api/v1/stories/category/:category
// @access  Public
exports.getStoriesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    const stories = await Story.find({ category })
      .sort({ readCount: -1 })
      .select('title slug excerpt category city characterName characterAge readCount backgroundImage characterAvatar');
    
    res.status(200).json({
      success: true,
      count: stories.length,
      data: stories
    });
  } catch (error) {
    console.error("Error fetching stories by category:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching stories by category",
      error: error.message
    });
  }
};

// @desc    Toggle featured status
// @route   PATCH /api/v1/stories/:id/toggle-featured
// @access  Public/Admin
exports.toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;
    
    const story = await Story.findById(id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found"
      });
    }
    
    story.featured = !story.featured;
    await story.save();
    
    res.status(200).json({
      success: true,
      message: `Story ${story.featured ? 'marked as' : 'removed from'} featured`,
      data: story
    });
  } catch (error) {
    console.error("Error toggling featured:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling featured status",
      error: error.message
    });
  }
};

// @desc    Toggle trending status
// @route   PATCH /api/v1/stories/:id/toggle-trending
// @access  Public/Admin
exports.toggleTrending = async (req, res) => {
  try {
    const { id } = req.params;
    
    const story = await Story.findById(id);
    
    if (!story) {
      return res.status(404).json({
        success: false,
        message: "Story not found"
      });
    }
    
    story.trending = !story.trending;
    await story.save();
    
    res.status(200).json({
      success: true,
      message: `Story ${story.trending ? 'marked as' : 'removed from'} trending`,
      data: story
    });
  } catch (error) {
    console.error("Error toggling trending:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling trending status",
      error: error.message
    });
  }
};

exports.getAllSlugs = async (req, res) => {
  try {
    // Get slugs with titles
    const stories = await Story.find({}).select('slug');
    
    res.status(200).json({
      success: true,
      count: stories.length,
      stories: stories
    });
  } catch (error) {
    console.error("Error fetching story slugs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching story slugs",
      error: error.message
    });
  }
};

