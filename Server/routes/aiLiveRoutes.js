const express = require('express');
const { getAllAiLive, createAiLive, updateAiLive, deleteAiLive, incrementAiLiveView } = require('../controllers/aiLiveController');
const router = express.Router();

router.route('/')
  .get(getAllAiLive)
  .post(createAiLive);

router.route('/:id')
  .put(updateAiLive)
  .delete(deleteAiLive);

router.route('/:id/view')
  .post(incrementAiLiveView);

module.exports = router;
