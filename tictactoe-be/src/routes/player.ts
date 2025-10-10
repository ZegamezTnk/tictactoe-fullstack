import { Hono } from 'hono';
import { supabase } from '../config/supabase';
import type { HonoVariables } from '../types/supabase';

const app = new Hono<{ Variables: HonoVariables }>();

// ✅ Auth middleware - ต้องมี
app.use('*', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const token = authHeader.replace('Bearer ', '');
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return c.json({ error: 'Invalid token' }, 401);
    }
    
    c.set('user', user);
    await next();
  } catch (error) {
    console.error('Auth error:', error);
    return c.json({ error: 'Authentication failed' }, 401);
  }
});

// ✅ GET /stats - ต้องมี route นี้
app.get('/stats', async (c) => {
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({ error: 'userId is required' }, 400);
    }

    console.log('📊 Getting stats for:', userId);

    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('Player not found, returning default stats');
        return c.json({
          score: 0,
          current_win_streak: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          easyWins: 0,
          mediumWins: 0,
          hardWins: 0,
        });
      }
      throw error;
    }

    console.log('✅ Stats found:', data);
    return c.json(data);
  } catch (error) {
    console.error('❌ Get stats error:', error);
    return c.json({ error: 'Failed to get stats' }, 500);
  }
});

// ✅ POST /stats - อัพเดท stats
app.post('/stats', async (c) => {
  try {
    const { userId, result, difficulty } = await c.req.json();

    if (!userId || !result || !difficulty) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    console.log('💾 Updating stats:', { userId, result, difficulty });

    const { data: player } = await supabase
      .from('players')
      .select('*')
      .eq('user_id', userId)
      .single();

    const currentScore = player?.score || 0;
    const currentWinStreak = player?.current_win_streak || 0;
    const wins = player?.wins || 0;
    const losses = player?.losses || 0;
    const draws = player?.draws || 0;

    let newScore = currentScore;
    let newWinStreak = currentWinStreak;
    let newWins = wins;
    let newLosses = losses;
    let newDraws = draws;

    if (result === 'win') {
      newScore += 1;
      newWinStreak += 1;
      newWins += 1;
    } else if (result === 'lose') {
      newScore = Math.max(0, newScore - 1);
      newWinStreak = 0;
      newLosses += 1;
    } else if (result === 'draw') {
      newWinStreak = 0;
      newDraws += 1;
    }

    const { data, error } = await supabase
      .from('players')
      .upsert({
        user_id: userId,
        score: newScore,
        current_win_streak: newWinStreak,
        wins: newWins,
        losses: newLosses,
        draws: newDraws,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Stats updated:', data);
    return c.json(data);
  } catch (error) {
    console.error('❌ Update stats error:', error);
    return c.json({ error: 'Failed to update stats' }, 500);
  }
});

export default app;