const express = require('express');
const router = express.Router();

const {
  createTopic,
  listTopics,
  getTopic,
  updateTopic,
  deleteTopic,
  bulkUploadTopics
} = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');
const { validate } = require('../middleware/validateRequest');
const { adminLimiter } = require('../middleware/rateLimiter');

router.use(adminAuth);
router.use(adminLimiter);

/**
 * POST /api/admin/topics
 * Create a new topic
 */
router.post('/topics', validate('createTopic'), createTopic);

/**
 * GET /api/admin/topics
 * List all topics
 */
router.get('/topics', validate('pagination', 'query'), listTopics);

/**
 * GET /api/admin/topics/:topic_id
 * Get topic details
 */
router.get('/topics/:topic_id', getTopic);

/**
 * PUT /api/admin/topics/:topic_id
 * Update a topic
 */
router.put('/topics/:topic_id', validate('updateTopic'), updateTopic);

/**
 * DELETE /api/admin/topics/:topic_id
 * Delete a topic
 */
router.delete('/topics/:topic_id', deleteTopic);

/**
 * POST /api/admin/topics/bulk
 * Bulk upload topics
 */
router.post('/topics/bulk', validate('bulkUpload'), bulkUploadTopics);

module.exports = router;
