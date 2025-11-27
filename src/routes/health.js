const express = require('express');
const router = express.Router();
const { checkConnection } = require('../config/database');

/**
 * GET /health
 * Basic health check
 */
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * GET /health/ready
 * Readiness check (includes database)
 */
router.get('/ready', async (req, res) => {
  const dbConnected = checkConnection();

  if (!dbConnected) {
    return res.status(503).json({
      status: 'error',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }

  res.json({
    status: 'ok',
    database: 'connected',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * GET /health/live
 * Liveness check
 */
router.get('/live', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
