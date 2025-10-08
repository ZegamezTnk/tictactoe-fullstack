import { Hono } from 'hono';
import { supabaseClient } from '../config/supabase.js';
import { HonoVariables } from '../types/supabase.js';

const auth = new Hono<{ Variables: HonoVariables }>();


auth.get('/health', (c) => {
  return c.json({ status: 'ok' });
});


auth.get('/verify', async (c) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'No token provided' }, 401);
  }
  
  const token = authHeader.substring(7);
  
  const { data: { user }, error } = await supabaseClient.auth.getUser(token);
  
  if (error || !user) {
    return c.json({ error: 'Invalid token' }, 401);
  }
  
  return c.json({ user });
});

// Logout
auth.post('/logout', async (c) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'No token provided' }, 401);
  }
  
  const { error } = await supabaseClient.auth.signOut();
  
  if (error) {
    console.error('Logout error:', error);
    return c.json({ error: 'Failed to logout' }, 500);
  }
  
  return c.json({ message: 'Logged out successfully' });
});

export default auth;