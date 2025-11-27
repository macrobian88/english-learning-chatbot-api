const { processChat, processChatStream } = require('../services/chatService');
const logger = require('../utils/logger');

async function chat(req, res, next) {
  try {
    const { user_id, topic_id, message } = req.body;
    logger.info(`Chat request: user=${user_id}, topic=${topic_id}`);

    const result = await processChat(user_id, topic_id, message);
    res.json({ success: true, reply: result.reply, conversation_id: result.conversationId });
  } catch (error) {
    next(error);
  }
}

async function chatStream(req, res, next) {
  try {
    const { user_id, topic_id, message } = req.body;
    logger.info(`Stream chat request: user=${user_id}, topic=${topic_id}`);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    let isConnected = true;
    req.on('close', () => {
      isConnected = false;
      logger.debug('Client disconnected from stream');
    });

    await processChatStream(
      user_id,
      topic_id,
      message,
      (content) => {
        if (isConnected && content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      },
      (result) => {
        if (isConnected) {
          res.write(`data: ${JSON.stringify({ done: true, conversation_id: result.conversationId })}\n\n`);
          res.end();
        }
      }
    );
  } catch (error) {
    if (!res.headersSent) res.setHeader('Content-Type', 'text/event-stream');
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
    logger.error('Stream chat error:', error);
  }
}

module.exports = { chat, chatStream };
