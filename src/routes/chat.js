const express = require('express');
const router = express.Router();

const { chat, chatStream } = require('../controllers/chatController');
const { validate } = require('../middleware/validateRequest');
const { chatLimiter } = require('../middleware/rateLimiter');

router.use(chatLimiter);

/**
 * POST /api/chat
 * Non-streaming chat endpoint
 */
router.post('/', validate('chat'), chat);

/**
 * POST /api/chat/stream
 * Streaming chat endpoint (SSE)
 */
router.post('/stream', validate('chat'), chatStream);

module.exports = router;
