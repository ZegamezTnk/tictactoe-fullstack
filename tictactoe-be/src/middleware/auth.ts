import { Context, Next } from 'hono';
import { supabase } from '../config/supabase.js';
import { HonoVariables, SupabaseUser } from '../types/supabase.js';

export const authMiddleware = async (c: Context<{ Variables: HonoVariables }>, next: Next) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }
  
  const token = authHeader.substring(7);
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }
  

  c.set('user', user as SupabaseUser);
  
  await next();
};