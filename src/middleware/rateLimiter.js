const rateLimit = require('express-rate-limit');

const chatLimiter = (options = {}) => {
  const {
    windowMs = 60 * 1000, // 1 minute
    max = 2, // 2 requests/min (window)
    standardHeaders = true,
    legacyHeaders = false,
    errorMessage = 'Too many requests, please try again later.',
    statusCode = 429,
  } = options;

  const limiter = rateLimit({
    windowMs,
    max,
    headers: standardHeaders ? true : legacyHeaders ? false : undefined,
    handler: (req, res /*, next */) => {
      const resetTimeInSeconds = Math.ceil(windowMs / 1000);
      res.status(statusCode).json({
        error: {
          type: 'rate_limited',
          message: errorMessage,
          retryAfter: resetTimeInSeconds,
        },
      });
    },
  });

  return limiter;
};

module.exports = chatLimiter;