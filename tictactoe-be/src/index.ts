import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import playerRoutes from './routes/player';
import leaderboardRoutes from './routes/leaderboard';
import { HonoVariables } from './types/supabase';

dotenv.config();

const app = new Hono<{ Variables: HonoVariables }>();

// ✅ CORS Middleware - รองรับหลาย origins
app.use('*', cors({
  origin: (origin) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3001',
      'https://tictactoe-frontend-lhd18wa4s-zegamezs-projects.vercel.app',
      process.env.FRONTEND_URL,
      process.env.CORS_ORIGIN,
    ].filter(Boolean);

    // อนุญาตถ้าไม่มี origin (Postman, mobile apps)
    if (!origin) return 'http://localhost:5173';

    // อนุญาตถ้า origin ตรงกับ whitelist
    const isAllowed = allowedOrigins.some(allowed => 
      origin === allowed || origin.startsWith(allowed)
    );

    if (isAllowed) {
      console.log('✅ Allowed origin:', origin);
      return origin;
    }

    console.log('❌ Blocked origin:', origin);
    return 'http://localhost:5173'; // fallback
  },
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
}));

// Logger Middleware
app.use('*', logger());

// Custom logging
app.use('*', async (c, next) => {
  const start = Date.now();
  console.log(`→ ${c.req.method} ${c.req.url}`);
  console.log(`  Origin: ${c.req.header('origin') || 'none'}`);
  await next();
  const end = Date.now();
  console.log(`← ${c.res.status} (${end - start}ms)`);
});

// Health check
app.get('/', (c) => {
  return c.json({
    message: 'Tic-Tac-Toe API with Supabase',
    status: 'running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    cors: {
      frontend: process.env.FRONTEND_URL,
      origin: process.env.CORS_ORIGIN,
    }
  });
});

// Routes
app.route('/api/auth', authRoutes);
app.route('/api/player', playerRoutes);
app.route('/api/leaderboard', leaderboardRoutes);

// Error handling
app.onError((err, c) => {
  console.error('❌ Error:', err.message);
  return c.json({ 
    error: err.message,
    status: 'error' 
  }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({ 
    error: 'Not Found',
    path: c.req.url 
  }, 404);
});

const PORT = process.env.PORT || 3001;

console.log(`\n🚀 Starting Hono.js server...`);
console.log(`📍 Port: ${PORT}`);
console.log(`🌍 CORS Origins:`);
console.log(`   - http://localhost:5173`);
console.log(`   - ${process.env.FRONTEND_URL || 'not set'}`);
console.log(`   - ${process.env.CORS_ORIGIN || 'not set'}\n`);

export default {
  port: PORT,
  fetch: app.fetch,
};