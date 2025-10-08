import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server'; // เพิ่มบรรทัดนี้
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
    version: '1.0.0'
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

const PORT = parseInt(process.env.PORT || '3001');


serve({
  fetch: app.fetch,
  port: PORT
}, (info) => {
  console.log(`🚀 Server running on http://localhost:${info.port}`);
});