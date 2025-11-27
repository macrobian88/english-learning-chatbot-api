const express = require('express');
const router = express.Router();

const {
  listConversations,
  getConversation,
  deleteConversation
} = require('../controllers/conversationController');
const { validate } = require('../middleware/validateRequest');

/**
 * GET /api/conversations
 * List all conversations for a user
 */
router.get('/', validate('conversationQuery', 'query'), listConversations);

/**
 * GET /api/conversations/:topic_id
 * Get specific conversation history
 */
router.get('/:topic_id', validate('conversationQuery', 'query'), getConversation);

/**
 * DELETE /api/conversations/:topic_id
 * Delete/clear a conversation
 */
router.delete('/:topic_id', validate('conversationQuery', 'query'), deleteConversation);

module.exports = router;
