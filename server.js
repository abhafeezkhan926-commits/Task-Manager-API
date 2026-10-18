require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const taskRoutes = require('./routes/taskRoutes');
const aiRoutes = require('./routes/aiRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '100kb' }));

app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Task Manager API is running.',
    endpoints: {
      health: '/health',
      tasks: '/api/tasks',
      aiPlanner: '/api/ai/plan-task',
    },
  });
});

app.get('/health', (_req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  res.status(dbReady ? 200 : 503).json({
    success: dbReady,
    service: 'task-manager-api',
    database: dbReady ? 'connected' : 'disconnected',
  });
});

app.use('/api/tasks', taskRoutes);
app.use('/api/ai', aiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

let server;

async function startServer() {
  try {
    await connectDB();
    const port = Number(process.env.PORT) || 5000;
    server = app.listen(port, () => {
      console.log(`Task Manager API listening on port ${port}`);
    });
  } catch (error) {
    console.error(`Startup failed: ${error.message}`);
    process.exitCode = 1;
  }
}

async function shutdown(signal) {
  console.log(`${signal} received. Closing server...`);
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await mongoose.connection.close().catch(() => {});
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

if (require.main === module) {
  startServer();
}

module.exports = app;
