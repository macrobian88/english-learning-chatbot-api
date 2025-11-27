const openai = require('../config/openai');
const Topic = require('../models/Topic');
const Chunk = require('../models/Chunk');
const Conversation = require('../models/Conversation');
const { generateEmbedding } = require('./embeddingService');
const config = require('../config');
const logger = require('../utils/logger');

/**
 * Build system prompt for the chatbot
 */
function buildSystemPrompt(topic, context) {
  return `You are an English learning assistant for the topic: "${topic.title}"

RELEVANT CONTEXT (use ONLY this information to answer):
"""
${context}
"""

STRICT RULES:
1. ONLY answer questions that can be answered using the context above
2. If the user asks ANYTHING that cannot be answered from the context, respond EXACTLY with:
   "I can only help with questions about ${topic.title}. Please ask something related to this topic."
3. Be helpful, encouraging, and use simple English appropriate for learners
4. Give examples when explaining grammar or vocabulary concepts
5. Never make up information not present in the context
6. If you're unsure whether information is in the context, err on the side of caution and redirect the user`;
}

/**
 * Perform vector search to find relevant chunks
 */
async function vectorSearch(topicId, query) {
  const queryEmbedding = await generateEmbedding(query);

  const results = await Chunk.aggregate([
    {
      $vectorSearch: {
        index: config.vectorSearch.indexName,
        path: 'embedding',
        queryVector: queryEmbedding,
        numCandidates: config.vectorSearch.numCandidates,
        limit: config.vectorSearch.limit,
        filter: { topic_id: topicId }
      }
    },
    {
      $project: {
        content: 1,
        file_name: 1,
        chunk_index: 1,
        score: { $meta: 'vectorSearchScore' }
      }
    }
  ]);

  return results;
}

/**
 * Get conversation history for a user and topic
 */
async function getConversationHistory(userId, topicId) {
  const conversation = await Conversation.findOne({ user_id: userId, topic_id: topicId });
  
  if (!conversation) return [];

  return conversation.messages.slice(-config.chat.maxConversationHistory);
}

/**
 * Save messages to conversation history
 */
async function saveConversation(userId, topicId, userMessage, assistantReply) {
  await Conversation.findOneAndUpdate(
    { user_id: userId, topic_id: topicId },
    {
      $push: {
        messages: {
          $each: [
            { role: 'user', content: userMessage, timestamp: new Date() },
            { role: 'assistant', content: assistantReply, timestamp: new Date() }
          ]
        }
      },
      $set: { updated_at: new Date() }
    },
    { upsert: true, new: true }
  );
}

/**
 * Process a chat message (non-streaming)
 */
async function processChat(userId, topicId, message) {
  const topic = await Topic.findOne({ topic_id: topicId });
  if (!topic) {
    throw new Error(`Topic ${topicId} not found`);
  }

  const relevantChunks = await vectorSearch(topicId, message);
  
  if (relevantChunks.length === 0) {
    logger.warn(`No chunks found for topic ${topicId}`);
  }

  const context = relevantChunks.map(c => c.content).join('\n\n---\n\n');
  const history = await getConversationHistory(userId, topicId);

  const messages = [
    { role: 'system', content: buildSystemPrompt(topic, context) },
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message }
  ];

  const completion = await openai.chat.completions.create({
    model: config.openai.model,
    messages,
    max_tokens: config.openai.maxTokens,
    temperature: 0.7
  });

  const reply = completion.choices[0].message.content;

  await saveConversation(userId, topicId, message, reply);

  const conversation = await Conversation.findOne({ user_id: userId, topic_id: topicId });

  return {
    reply,
    conversationId: conversation._id.toString()
  };
}

/**
 * Process a chat message with streaming
 */
async function processChatStream(userId, topicId, message, onChunk, onComplete) {
  const topic = await Topic.findOne({ topic_id: topicId });
  if (!topic) {
    throw new Error(`Topic ${topicId} not found`);
  }

  const relevantChunks = await vectorSearch(topicId, message);
  const context = relevantChunks.map(c => c.content).join('\n\n---\n\n');
  const history = await getConversationHistory(userId, topicId);

  const messages = [
    { role: 'system', content: buildSystemPrompt(topic, context) },
    ...history.map(m => ({ role: m.role, content: m.content })),
    { role: 'user', content: message }
  ];

  const stream = await openai.chat.completions.create({
    model: config.openai.model,
    messages,
    max_tokens: config.openai.maxTokens,
    temperature: 0.7,
    stream: true
  });

  let fullReply = '';

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    fullReply += content;
    onChunk(content);
  }

  await saveConversation(userId, topicId, message, fullReply);

  const conversation = await Conversation.findOne({ user_id: userId, topic_id: topicId });

  onComplete({
    fullReply,
    conversationId: conversation._id.toString()
  });
}

module.exports = {
  processChat,
  processChatStream,
  getConversationHistory,
  buildSystemPrompt,
  vectorSearch
};
