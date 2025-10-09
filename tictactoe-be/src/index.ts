import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import playerRoutes from './routes/player.js';
import leaderboardRoutes from './routes/leaderboard.js';
import { HonoVariables } from './types/supabase.js';

dotenv.config();

const app = new Hono<{ Variables: HonoVariables }>();

// Middleware
app.use('*', logger());
app.use('*', cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

// Health check
app.get('/', (c) => {
  return c.json({
    message: 'Tic-Tac-Toe API with Supabase',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.route('/api/auth', authRoutes);
app.route('/api/player', playerRoutes);
app.route('/api/leaderboard', leaderboardRoutes);

// 404
app.notFound((c) => c.json({ error: 'Not Found' }, 404));

// Error Handler
app.onError((err, c) => {
  console.error('Server Error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

// Important: Use PORT from Railway environment
const PORT = parseInt(process.env.PORT || '3001');

console.log(`Starting server on port ${PORT}`);

// Start server with @hono/node-server
serve({
  fetch: app.fetch,
  port: PORT,
  hostname: '0.0.0.0' // Important for Railway
}, (info) => {
  console.log(`🚀 Server running on http://0.0.0.0:${info.port}`);
});