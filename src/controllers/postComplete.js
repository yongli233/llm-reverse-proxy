const axios = require('axios');
const { CLAUDE_API_URL, CLAUDE_API_KEY, PROXY_API_KEY } = process.env;

let anthropicRequestCount = 0;

module.exports = async (req, res, next) => {
  const apiKeyHeader = req.headers['x-api-key'];
  if (!apiKeyHeader || apiKeyHeader !== PROXY_API_KEY) {
    return next(new Error('Unauthorized access.'));
  }
  try {
    const openaiResponse = await axios.post(`${CLAUDE_API_URL}/complete`, req.body, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': `${CLAUDE_API_KEY}`
      },
      responseType: 'stream',
      timeout: 1 * 60 * 1000
    });

    anthropicRequestCount++;

    res.status(openaiResponse.status);
    res.set(openaiResponse.headers);

    openaiResponse.data.pipe(res);
  } catch (error) {
    next(error);
  }
};