const express = require('express');
const pool = require('./db');
const taskRoutes = require('./routes/tasks');

const app = express();
const port = Number(process.env.PORT || 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT must be an integer between 1 and 65535.');
}

app.use(express.json({ limit: '10kb' }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/tasks', taskRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found.',
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Request body contains invalid JSON.',
    });
  }

  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Request body is too large.',
    });
  }

  console.error(error);

  return res.status(500).json({
    error: 'An unexpected server error occurred.',
  });
});

async function start() {
  try {
    const result = await pool.query(
      'SELECT current_database() AS database'
    );

    console.log(`Connected to database: ${result.rows[0].database}`);

    const server = app.listen(port, 'localhost', () => {
      console.log(`API running at http://localhost:${port}`);
    });

    server.on('error', (error) => {
      console.error('HTTP server failed:', error);
      process.exit(1);
    });
  } catch (error) {
    console.error('Database startup check failed:', error.message);
    await pool.end();
    process.exitCode = 1;
  }
}

start();