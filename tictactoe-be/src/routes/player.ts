import { Hono } from 'hono';
import { supabase } from '../config/supabase';
import type { HonoVariables } from '../types/supabase';

const app = new Hono<{ Variables: HonoVariables }>();

// Auth middleware
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

// ✅ Helper function: Get or create player
async function getOrCreatePlayer(userId: string) {
  try {
    // Try to get existing player
    const { data: player, error } = await supabase
      .from('players')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // Player not found, create new one
      console.log('🆕 Creating new player for:', userId);
      
      const { data: newPlayer, error: createError } = await supabase
        .from('players')
        .insert({
          user_id: userId,
          score: 0,
          current_win_streak: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Failed to create player:', createError);
        throw createError;
      }

      console.log('✅ Player created:', newPlayer);
      return newPlayer;
    }

    if (error) throw error;

    return player;
  } catch (error) {
    console.error('❌ getOrCreatePlayer error:', error);
    throw error;
  }
}

// GET /api/player/stats
app.get('/stats', async (c) => {
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({ error: 'userId is required' }, 400);
    }

    console.log('📊 Getting stats for:', userId);

    // ✅ Get or create player
    const player = await getOrCreatePlayer(userId);

    console.log('✅ Stats found:', player);
    return c.json(player);
  } catch (error) {
    console.error('❌ Get stats error:', error);
    return c.json({ error: 'Failed to get stats' }, 500);
  }
});

// POST /api/player/stats
app.post('/stats', async (c) => {
  try {
    const { userId, result, difficulty } = await c.req.json();

    if (!userId || !result || !difficulty) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    console.log('💾 Updating stats:', { userId, result, difficulty });

    // ✅ Get or create player first
    const player = await getOrCreatePlayer(userId);

    const currentScore = player.score || 0;
    const currentWinStreak = player.current_win_streak || 0;
    const wins = player.wins || 0;
    const losses = player.losses || 0;
    const draws = player.draws || 0;

    let newScore = currentScore;
    let newWinStreak = currentWinStreak;
    let newWins = wins;
    let newLosses = losses;
    let newDraws = draws;

    // Calculate new stats
    if (result === 'win') {
      newScore += 1;
      newWinStreak += 1;
      newWins += 1;
      console.log('🏆 Win! New score:', newScore, 'Streak:', newWinStreak);
    } else if (result === 'lose') {
      newScore = Math.max(0, newScore - 1);
      newWinStreak = 0;
      newLosses += 1;
      console.log('😢 Loss! New score:', newScore);
    } else if (result === 'draw') {
      newWinStreak = 0;
      newDraws += 1;
      console.log('🤝 Draw! Score unchanged');
    }

    // Update player
    const { data, error } = await supabase
      .from('players')
      .update({
        score: newScore,
        current_win_streak: newWinStreak,
        wins: newWins,
        losses: newLosses,
        draws: newDraws,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('❌ Update error:', error);
      throw error;
    }

    console.log('✅ Stats updated:', data);
    return c.json(data);
  } catch (error) {
    console.error('❌ Update stats error:', error);
    return c.json({ 
      error: 'Failed to update stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default app;