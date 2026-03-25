'use strict';

require('dotenv').config();
const app = require('./src/app');
const pool = require('./src/config/db');
const env = require('./src/config/env');

const PORT = env.PORT || 5000;

const start = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Database connection verified');

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${env.NODE_ENV}`);
      console.log(`🛑 Press Ctrl+C to stop`);
    });

    // Keep the process alive indefinitely
    const keepAlive = setInterval(() => {}, 1 << 30);

    const shutdown = async (signal) => {
      console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
      clearInterval(keepAlive);
      server.close(async () => {
        await pool.end();
        console.log('✅ Server and DB pool closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));   // Ctrl+C
    process.on('SIGTERM', () => shutdown('SIGTERM')); // kill command

    // Prevent crash on unhandled errors — log and keep running
    process.on('uncaughtException', (err) => {
      console.error('❌ Uncaught Exception:', err.message);
    });
    process.on('unhandledRejection', (reason) => {
      console.error('❌ Unhandled Rejection:', reason);
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

start();

