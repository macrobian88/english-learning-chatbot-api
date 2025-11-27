const openai = require('../config/openai');
const config = require('../config');
const logger = require('../utils/logger');

const BATCH_SIZE = 100;

async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: config.openai.embeddingModel,
      input: text
    });
    return response.data[0].embedding;
  } catch (error) {
    logger.error('Error generating embedding:', error);
    throw error;
  }
}

async function generateEmbeddingsBatch(texts) {
  const allEmbeddings = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    try {
      const response = await openai.embeddings.create({
        model: config.openai.embeddingModel,
        input: batch
      });
      const embeddings = response.data.map(item => item.embedding);
      allEmbeddings.push(...embeddings);
      logger.debug(`Generated embeddings for batch ${Math.floor(i / BATCH_SIZE) + 1}`);
    } catch (error) {
      logger.error(`Error generating embeddings for batch starting at ${i}:`, error);
      throw error;
    }
  }

  return allEmbeddings;
}

module.exports = { generateEmbedding, generateEmbeddingsBatch };
