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

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if slug already exists
    const existingStory = await Story.findOne({ slug });
    if (existingStory) {
      return res.status(400).json({
        success: false,
        message: "Story with this title already exists"
      });
    }

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
      limit = 10,
      page = 1
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (category && category !== 'All') {
      filter.category = category;
    }
    
    if (city && city !== 'All Cities') {
      filter.city = city;
    }
    
    if (featured) {
      filter.featured = featured === 'true';
    }
    
    if (trending) {
      filter.trending = trending === 'true';
    }
    
    // Search functionality
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { 'characterName': { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get total count for pagination
    const total = await Story.countDocuments(filter);
    
    // Get stories
    const stories = await Story.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-content_en.story -content_hi.story'); // Don't send full story content in list

    // Get featured stories separately
    const featuredStories = await Story.find({ featured: true })
      .limit(4)
      .sort({ readCount: -1 });

    res.status(200).json({
      success: true,
      count: stories.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: stories,
      featured: featuredStories
    });
  } catch (error) {
    console.error("Error fetching stories:", error);
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

