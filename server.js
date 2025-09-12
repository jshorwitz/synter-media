// Simple standalone server for Railway deployment
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Simple health check that always works
app.get('/health', (req, res) => {
  console.log('Health check requested');
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    port: process.env.PORT,
    env: process.env.NODE_ENV || 'development'
  });
});

// Basic API routes
app.get('/', (req, res) => {
  res.json({ message: 'Synter API is running', version: '1.0.0' });
});

app.get('/auth/me', (req, res) => {
  res.json({ id: 1, email: 'demo@example.com', role: 'admin' });
});

app.get('/agents/list', (req, res) => {
  res.json({ 
    agents: [
      'ingestor-google',
      'ingestor-reddit', 
      'ingestor-x',
      'touchpoint-extractor',
      'conversion-uploader',
      'budget-optimizer'
    ]
  });
});

// Start server
const port = parseInt(process.env.PORT || '8088');
const host = '0.0.0.0';

app.listen(port, host, () => {
  console.log(`🚀 Synter API listening on ${host}:${port}`);
  console.log(`Health check: http://${host}:${port}/health`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
