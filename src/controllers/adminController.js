const Topic = require('../models/Topic');
const Chunk = require('../models/Chunk');
const Conversation = require('../models/Conversation');
const { processTopicFiles, updateTopicFiles, deleteTopic } = require('../services/chunkingService');
const logger = require('../utils/logger');

async function createTopic(req, res, next) {
  try {
    const { topic_id, title, files, metadata } = req.body;

    logger.info(`Creating topic: ${topic_id}`);

    const result = await processTopicFiles(topic_id, title, files, metadata);

    res.status(201).json({
      success: true,
      topic_id: result.topic_id,
      chunks_created: result.chunks_created
    });
  } catch (error) {
    next(error);
  }
}

async function listTopics(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [topics, total] = await Promise.all([
      Topic.find()
        .select('topic_id title file_count total_chunks metadata created_at')
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Topic.countDocuments()
    ]);

    res.json({
      success: true,
      topics,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
}

async function getTopic(req, res, next) {
  try {
    const { topic_id } = req.params;

    const topic = await Topic.findOne({ topic_id }).lean();

    if (!topic) {
      return res.status(404).json({
        success: false,
        error: 'Topic not found'
      });
    }

    const sampleChunks = await Chunk.find({ topic_id })
      .select('file_name chunk_index content')
      .limit(5)
      .lean();

    res.json({
      success: true,
      topic: {
        ...topic,
        sample_chunks: sampleChunks.map(c => ({
          file_name: c.file_name,
          chunk_index: c.chunk_index,
          content_preview: c.content.substring(0, 200) + '...'
        }))
      }
    });
  } catch (error) {
    next(error);
  }
}

async function updateTopic(req, res, next) {
  try {
    const { topic_id } = req.params;
    const { title, files, metadata } = req.body;

    logger.info(`Updating topic: ${topic_id}`);

    const result = await updateTopicFiles(topic_id, title, files, metadata);

    res.json({
      success: true,
      topic_id: result.topic_id,
      chunks_created: result.chunks_created
    });
  } catch (error) {
    next(error);
  }
}

async function deleteTopicHandler(req, res, next) {
  try {
    const { topic_id } = req.params;
    const { delete_conversations } = req.query;

    logger.info(`Deleting topic: ${topic_id}`);

    await deleteTopic(topic_id);

    if (delete_conversations === 'true') {
      await Conversation.deleteMany({ topic_id });
      logger.info(`Deleted conversations for topic: ${topic_id}`);
    }

    res.json({
      success: true,
      message: 'Topic deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

async function bulkUploadTopics(req, res, next) {
  try {
    const { topics } = req.body;

    logger.info(`Bulk uploading ${topics.length} topics`);

    const results = [];
    const errors = [];

    for (const topic of topics) {
      try {
        const result = await processTopicFiles(
          topic.topic_id,
          topic.title,
          topic.files,
          topic.metadata
        );
        results.push(result);
      } catch (error) {
        errors.push({
          topic_id: topic.topic_id,
          error: error.message
        });
      }
    }

    res.status(errors.length > 0 ? 207 : 201).json({
      success: errors.length === 0,
      created: results,
      errors
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createTopic,
  listTopics,
  getTopic,
  updateTopic,
  deleteTopic: deleteTopicHandler,
  bulkUploadTopics
};
