const axios = require('axios');
const { OPENAI_API_KEY, PROXY_API_KEY } = process.env;

let OPENAI_API_URL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1';

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new Error('Unauthorized access.'));
    }

    const providedApiKey = authHeader.split(' ')[1];
    if (providedApiKey !== PROXY_API_KEY) {
      return next(new Error('Invalid API Key.'));
    }

    const response = await axios.get(`${OPENAI_API_URL}/models`, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const models = response.data;
    const result = {
      object: 'list',
      data: models
    };

    res.json(result);
  } catch (error) {
    next(error);
  }
};
