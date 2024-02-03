require('dotenv').config();
const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const ip = require('ip');
const helmet = require('helmet');

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
  windowMs: 60 * 1000,
  max: 2,
  total: 50,
  handler: function (req, res, next) {
    next(new Error('Rate limit exceeded'));
  },
  getKey: function (req) {
    return ip.address();
  }
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true, parameterLimit: 50000 }));
app.use(helmet());
app.use(cors());
app.set('trust proxy', 1);
app.use(express.json());
app.use(morgan('combined'));
app.use(chatLimiter);

app.get('/', (req, res) => {
  res.json({ message: 'OpenCLM API is up and running!' });
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

app.post('/v1/chat/completions', async (req, res, next) => {
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

app.post('/v1/complete', async (req, res, next) => {
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
