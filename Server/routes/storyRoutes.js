const express = require('express');
const router = express.Router();
const storyController = require('../controllers/StoryController');

// Get all female AI friends for character selection
router.get('/get-female-ai-friends', storyController.getFemaleAIFriends);

// Get all stories with filters
router.get('/', storyController.getAllStories);

// Get featured stories
router.get('/featured', storyController.getFeaturedStories);

// Get trending stories
router.get('/trending', storyController.getTrendingStories);

// Get stories by city
router.get('/city/:city', storyController.getStoriesByCity);

// Get stories by category
router.get('/category/:category', storyController.getStoriesByCategory);

// Get single story by ID or slug
router.get('/getbyid/:id', storyController.getStoryById);

// Create new story
router.post('/create-story', storyController.createNewStory);

// Update story
router.put('/:id', storyController.updateStory);

// Delete story
router.delete('/:id', storyController.deleteStory);

// Toggle featured status
router.patch('/:id/toggle-featured', storyController.toggleFeatured);

// Toggle trending status
router.patch('/:id/toggle-trending', storyController.toggleTrending);


router.get('/get-slug', storyController.getAllSlugs);
module.exports = router;