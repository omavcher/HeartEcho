const AiLive = require('../models/AiLive');

// Get all AI influencers
exports.getAllAiLive = async (req, res) => {
  try {
    const aiLive = await AiLive.find();
    res.status(200).json({ success: true, count: aiLive.length, data: aiLive });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a new AI influencer
exports.createAiLive = async (req, res) => {
  try {
    const aiLive = await AiLive.create(req.body);
    res.status(201).json({ success: true, data: aiLive });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update an AI influencer
exports.updateAiLive = async (req, res) => {
  try {
    const aiLive = await AiLive.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!aiLive) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, data: aiLive });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete an AI influencer
exports.deleteAiLive = async (req, res) => {
  try {
    const aiLive = await AiLive.findByIdAndDelete(req.params.id);
    if (!aiLive) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Increment view count
exports.incrementAiLiveView = async (req, res) => {
  try {
    const aiLive = await AiLive.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!aiLive) return res.status(404).json({ success: false, message: "Not found" });
    res.status(200).json({ success: true, views: aiLive.views });
  } catch (error) {
    if (res) res.status(400).json({ success: false, message: error.message });
  }
};
