import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import playerRoutes from './routes/player;
import leaderboardRoutes from './routes/leaderboard';
import { HonoVariables } from './types/supabase';

dotenv.config();

const app = new Hono<{ Variables: HonoVariables }>();

// Logger Middleware
app.use('*', logger());

// CORS Middleware - รองรับ Vercel deployments ทุก URL
app.use('*', cors({
  origin: (origin) => {
    console.log('🌍 Request from origin:', origin);

    // อนุญาตถ้าไม่มี origin (API calls, Postman)
    if (!origin) {
      console.log('✅ No origin - allowed');
      return '*';
    }

    // Allowed patterns
    const allowedPatterns = [
      /^http:\/\/localhost:\d+$/,
      /^https:\/\/tictactoe-frontend-.*-zegamezs-projects\.vercel\.app$/,
      /^https:\/\/tictactoe-frontend-.*\.vercel\.app$/,
    ];

    // Check patterns
    const isAllowed = allowedPatterns.some(pattern => pattern.test(origin));

    // Check ENV variables
    const envOrigins = [
      process.env.FRONTEND_URL,
      process.env.CORS_ORIGIN,
    ].filter(Boolean);
    const isEnvAllowed = envOrigins.some(allowed => origin === allowed);

    if (isAllowed || isEnvAllowed) {
      console.log('✅ Origin allowed:', origin);
      return origin;
    }

    console.log('❌ Origin blocked:', origin);
    return origin;
  },
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
    timestamp: new Date().toISOString(),
    cors: {
      frontend_url: process.env.FRONTEND_URL || 'not set',
      cors_origin: process.env.CORS_ORIGIN || 'not set',
    }
  });
});

// Routes
app.route('/api/auth', authRoutes);
app.route('/api/player', playerRoutes);
app.route('/api/leaderboard', leaderboardRoutes);

// 404 Handler
app.notFound((c) => c.json({ error: 'Not Found', path: c.req.path }, 404));

// Error Handler
app.onError((err, c) => {
  console.error('❌ Server Error:', err);
  return c.json({ error: 'Internal Server Error', message: err.message }, 500);
});

// Port configuration
const PORT = parseInt(process.env.PORT || '3001');

console.log('\n🚀 Hono.js Server Starting...');
console.log('================================');
console.log(`📍 Port: ${PORT}`);
console.log(`🌍 CORS Patterns:`);
console.log(`   - localhost:*`);
console.log(`   - tictactoe-frontend-*-zegamezs-projects.vercel.app`);
console.log(`   - tictactoe-frontend-*.vercel.app`);
console.log(`   - ENV: ${process.env.FRONTEND_URL || 'not set'}`);
console.log('================================\n');

// Start server with @hono/node-server
serve({
  fetch: app.fetch,
  port: PORT,
  hostname: '0.0.0.0' // Important for Railway
}, (info) => {
  console.log(`✅ Server running on http://0.0.0.0:${info.port}`);
});