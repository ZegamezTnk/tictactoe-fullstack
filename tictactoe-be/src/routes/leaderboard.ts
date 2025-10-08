import { Hono } from 'hono';
import { supabase } from '../config/supabase.js';
import { HonoVariables } from '../types/supabase.js';

const leaderboard = new Hono<{ Variables: HonoVariables }>();


leaderboard.get('/', async (c) => {
  const limit = parseInt(c.req.query('limit') || '10');
  
  const { data, error } = await supabase
    .from('players')
    .select('user_id, name, picture, score, wins, losses, draws, total_games')
    .order('score', { ascending: false })
    .order('wins', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Leaderboard error:', error);
    return c.json({ error: 'Failed to get leaderboard' }, 500);
  }
  
  return c.json(data);
});

// player rank
leaderboard.get('/rank/:userId', async (c) => {
  const userId = c.req.param('userId');
  
  // player
  const { data: player, error: playerError } = await supabase
    .from('players')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (playerError) {
    return c.json({ error: 'Player not found' }, 404);
  }
  
  // Count players with higher score
  const { count, error: countError } = await supabase
    .from('players')
    .select('*', { count: 'exact', head: true })
    .gt('score', player.score);
  
  if (countError) {
    console.error('Rank error:', countError);
    return c.json({ error: 'Failed to calculate rank' }, 500);
  }
  
  const rank = (count || 0) + 1;
  
  return c.json({ rank, player });
});

export default leaderboard;