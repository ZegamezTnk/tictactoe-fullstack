import { supabaseClient } from '../config/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface AuthUser {
  id: string;
  email?: string;
  name: string;
  picture: string;
  provider: string;
}

class AuthService {
  private static instance: AuthService;
  private user: AuthUser | null = null;
  private token: string | null = null;

  private constructor() {
    this.loadSession();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async loadSession() {
    try {
      // Check Supabase session
      const { data: { session } } = await supabaseClient.auth.getSession();
      
      if (session) {
        this.token = session.access_token;
        this.user = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || 
                session.user.user_metadata?.full_name || 
                session.user.email || 'User',
          picture: session.user.user_metadata?.avatar_url || 
                   session.user.user_metadata?.picture || 
                   `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
          provider: session.user.app_metadata?.provider || 'unknown'
        };

        localStorage.setItem('auth_token', this.token);
        localStorage.setItem('auth_user', JSON.stringify(this.user));
      }
    } catch (error) {
      console.error('Load session error:', error);
    }
  }

  async loginWithGoogle() {
    try {
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  async loginWithGitHub() {
    try {
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('GitHub login error:', error);
      throw error;
    }
  }

  async handleCallback() {
    try {
      const { data: { session }, error } = await supabaseClient.auth.getSession();

      if (error) throw error;

      if (session) {
        this.token = session.access_token;
        this.user = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.name || 
                session.user.user_metadata?.full_name || 
                session.user.email || 'User',
          picture: session.user.user_metadata?.avatar_url || 
                   session.user.user_metadata?.picture || 
                   `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`,
          provider: session.user.app_metadata?.provider || 'unknown'
        };

        localStorage.setItem('auth_token', this.token);
        localStorage.setItem('auth_user', JSON.stringify(this.user));

        return this.user;
      }

      throw new Error('No session found');
    } catch (error) {
      console.error('Callback error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await supabaseClient.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.user = null;
      this.token = null;
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }
  }

  getUser(): AuthUser | null {
    return this.user;
  }

  getToken(): string | null {
    return this.token;
  }

  isAuthenticated(): boolean {
    return this.user !== null && this.token !== null;
  }
}

export default AuthService.getInstance();