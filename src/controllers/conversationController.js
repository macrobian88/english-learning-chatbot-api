const Conversation = require('../models/Conversation');
const Topic = require('../models/Topic');
const logger = require('../utils/logger');

/**
 * Get list of conversations for a user
 */
async function listConversations(req, res, next) {
  try {
    const { user_id } = req.query;

    const conversations = await Conversation.find({ user_id })
      .select('topic_id messages updated_at')
      .sort({ updated_at: -1 })
      .lean();

    const topicIds = conversations.map(c => c.topic_id);
    const topics = await Topic.find({ topic_id: { $in: topicIds } })
      .select('topic_id title')
      .lean();

    const topicMap = topics.reduce((acc, t) => {
      acc[t.topic_id] = t.title;
      return acc;
    }, {});

    const result = conversations.map(conv => ({
      topic_id: conv.topic_id,
      title: topicMap[conv.topic_id] || 'Unknown Topic',
      message_count: conv.messages.length,
      last_message: conv.messages.length > 0 
        ? conv.messages[conv.messages.length - 1].content.substring(0, 100)
        : null,
      updated_at: conv.updated_at
    }));

    res.json({
      success: true,
      conversations: result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get specific conversation history
 */
async function getConversation(req, res, next) {
  try {
    const { topic_id } = req.params;
    const { user_id } = req.query;

    const conversation = await Conversation.findOne({ user_id, topic_id }).lean();

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    const topic = await Topic.findOne({ topic_id }).select('title').lean();

    res.json({
      success: true,
      topic_id,
      title: topic?.title || 'Unknown Topic',
      messages: conversation.messages,
      created_at: conversation.created_at,
      updated_at: conversation.updated_at
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete/clear a conversation
 */
async function deleteConversation(req, res, next) {
  try {
    const { topic_id } = req.params;
    const { user_id } = req.query;

    const result = await Conversation.deleteOne({ user_id, topic_id });

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    logger.info(`Deleted conversation: user=${user_id}, topic=${topic_id}`);

    res.json({
      success: true,
      message: 'Conversation deleted'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listConversations,
  getConversation,
  deleteConversation
};
