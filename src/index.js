require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { PORT = 3000 } = process.env;
const routes = require('./routes');
const app = express();

// Middlewares
app.set('trust proxy', 1);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'tiny' : 'combined'));
app.use('/', routes);

// Server run
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Listening on port ${PORT}`);
}).on('error', (err) => {
  console.error(`Error starting server: ${err.message}`);
});
