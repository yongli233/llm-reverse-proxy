const express = require('express');
const router = express.Router();
const chatLimiter = require('../middleware/rateLimiter');
const { getRoot, getModels, postChatCompletions, postComplete } = require('../controllers');

router.get('/', getRoot);
router.get('/v1/models', getModels);
router.post('/v1/chat/completions', chatLimiter, postChatCompletions);
router.post('/v1/complete', chatLimiter, postComplete);

module.exports = router;
