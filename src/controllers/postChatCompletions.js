const axios = require('axios');
const { OPENAI_API_URL, OPENAI_API_KEY, PROXY_API_KEY } = process.env;

let openAIRequestCount = 0;

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new Error('Unauthorized access.'));
  }

  const providedApiKey = authHeader.split(' ')[1];
  if (providedApiKey !== PROXY_API_KEY) {
    return next(new Error('Invalid API Key.'));
  }

  try {
    const userMessages = req.body.messages;
    if (!userMessages) {
      return next(new Error('Invalid message format.'));
    }

    const userTextInput = userMessages[1].content;
    if (!userTextInput) {
      return next(new Error('User input is required.'));
    }

    const openaiResponse = await axios.post(`${OPENAI_API_URL}/chat/completions`, req.body, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      responseType: 'stream'
    });

    openAIRequestCount++; //counter

    res.status(openaiResponse.status);
    res.set(openaiResponse.headers);

    openaiResponse.data.pipe(res);
  } catch (error) {
    next(error);
  }
};
