const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  topic_id: {
    type: String,
    required: true,
    index: true
  },
  messages: [messageSchema]
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

conversationSchema.index({ user_id: 1, topic_id: 1 }, { unique: true });
conversationSchema.index({ updated_at: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
