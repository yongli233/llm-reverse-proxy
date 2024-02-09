const startTime = Date.now();
const postChatCompletions = require('./postChatCompletions');
const postComplete = require('./postComplete');

module.exports = (req, res) => {
  const uptime = Date.now() - startTime;
  const uptimeInSeconds = Math.floor(uptime / 1000);
  const uptimeInMinutes = Math.floor(uptimeInSeconds / 60);
  const uptimeInHours = Math.floor(uptimeInMinutes / 60);
  const uptimeInDays = Math.floor(uptimeInHours / 24);
  const readableUptime = `${uptimeInDays}d ${uptimeInHours % 24}h ${uptimeInMinutes % 60}m ${uptimeInSeconds % 60}s`;

  res.json({
    message: 'OpenCLM API is up and running!',
    uptime: readableUptime,
    openAIRequestCount: postChatCompletions.openAIRequestCount,
    anthropicRequestCount: postComplete.anthropicRequestCount,
    availableRoutes: [
      "/v1/models - list model",
      "/v1/chat/completions - OpenAI chat completions",
      "/v1/complete - Anthropic completions"
    ]
  });
};
