const getRoot = require('./getRoot');
const getModels = require('./getModels');
const postChatCompletions = require('./postChatCompletions');
const postComplete = require('./postComplete');

const requiredEnvVars = [
  { key: 'OPENAI_API_KEY', name: 'OpenAI API Key' },
  { key: 'CLAUDE_API_KEY', name: 'Anthropic API Key' },
  { key: 'PROXY_API_KEY', name: 'Proxy API Key' },
];

requiredEnvVars.forEach(({ key, name }) => {
  if (!process.env[key]) {
    console.warn(`Alert: ${name} environment variable is not set.`);
  }
});

module.exports = {
  getRoot,
  getModels,
  postChatCompletions,
  postComplete,
};
