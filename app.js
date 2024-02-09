require('dotenv').config();
const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const startTime = Date.now();

const {
  PORT = 3000,
  OPENAI_API_URL,
  OPENAI_API_KEY,
  PROXY_API_KEY,
  CLAUDE_API_KEY,
  CLAUDE_API_URL,
  ANTHROPIC_API_KEY
} = process.env;

const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 2, // 2 requests/min (window)
  standardHeaders: true,
  legacyHeaders: false,
  handler: function (req, res /*, next */) {
    // Basic ratelimit rough estimate ratelimit time
    const resetTimeInSeconds = Math.ceil(this.windowMs / 1000);
    res.status(429).json({
      error: {
        type: "get_ratelimited",
        message: `The proxy is ratelimited to ${this.max} prompts per minute. Please try again in about ${resetTimeInSeconds} seconds.`,
      },
    });
  },
});

const app = express();

app.use(helmet());
app.use(cors());
app.set('trust proxy', 1);
// Allow big requests to be handled 
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'tiny' : 'combined'));


app.get('/', (req, res) => {
  const uptime = Date.now() - startTime;
  const uptimeInSeconds = Math.floor(uptime / 1000);
  const uptimeInMinutes = Math.floor(uptimeInSeconds / 60);
  const uptimeInHours = Math.floor(uptimeInMinutes / 60);
  const uptimeInDays = Math.floor(uptimeInHours / 24);
  const readableUptime = `${uptimeInDays}d ${uptimeInHours % 24}h ${uptimeInMinutes % 60}m ${uptimeInSeconds % 60}s`;

  res.json({
    message: 'OpenCLM API is up and running!',
    uptime: readableUptime,
  });
});


app.get('/v1/models', async (req, res, next) => {
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
});

app.post('/v1/chat/completions', chatLimiter, async (req, res, next) => {
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
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      responseType: 'stream'
    });

    res.status(openaiResponse.status);
    res.set(openaiResponse.headers);

    openaiResponse.data.pipe(res);
  } catch (error) {
    next(error);
  }
});

app.post('/v1/complete', chatLimiter, async (req, res, next) => {
  const apiKeyHeader = req.headers['x-api-key'];
  if (!apiKeyHeader || apiKeyHeader !== ANTHROPIC_API_KEY) {
    return next(new Error('Unauthorized access.'));
  }

  try {
    const openaiResponse = await axios.post(`${CLAUDE_API_URL}/complete`, req.body, {
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': `${CLAUDE_API_KEY}`
      },
      responseType: 'stream'
    });

    res.status(openaiResponse.status);
    res.set(openaiResponse.headers);

    openaiResponse.data.pipe(res);
  } catch (error) {
    next(error);
  }
});


app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  res.status(500).json({ error: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Listening on port ${PORT}`);
}).on('error', (err) => {
  console.error(`Error starting server: ${err.message}`);
});
