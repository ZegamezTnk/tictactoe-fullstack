import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import playerRoutes from './routes/player';
import leaderboardRoutes from './routes/leaderboard';
import type { HonoVariables } from './types/supabase';

dotenv.config();

const app = new Hono<{ Variables: HonoVariables }>();

app.use('*', logger());

app.use('*', cors({
  origin: (origin) => {
    if (!origin) return '*';
    
    const allowedPatterns = [
      /^http:\/\/localhost:\d+$/,
      /^https:\/\/tictactoe-frontend-.*-zegamezs-projects\.vercel\.app$/,
      /^https:\/\/tictactoe-frontend-.*\.vercel\.app$/,
    ];
    
    const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));
    return isAllowed ? origin : origin;
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

app.get('/', (c) => {
  return c.json({
    message: 'Tic-Tac-Toe API with Supabase',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.route('/api/auth', authRoutes);
app.route('/api/player', playerRoutes);
app.route('/api/leaderboard', leaderboardRoutes);

app.notFound((c) => c.json({ error: 'Not Found' }, 404));

app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

const PORT = parseInt(process.env.PORT || '3001');

console.log(`🚀 Starting server on port ${PORT}`);

serve({
  fetch: app.fetch,
  port: PORT,
  hostname: '0.0.0.0'
}, (info) => {
  console.log(`✅ Server running on http://0.0.0.0:${info.port}`);
});