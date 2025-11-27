const OpenAI = require('openai');
const config = require('./index');

const openai = new OpenAI({
  apiKey: config.openai.apiKey
});

module.exports = openai;
