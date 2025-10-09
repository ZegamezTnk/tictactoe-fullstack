import { supabaseClient } from '../config/supabase';

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
  private sessionLoaded = false;

  private constructor() {
    // ไม่ต้อง load session ใน constructor
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Load session from Supabase (ไม่ใช้ localStorage)
   */
  async loadSession(): Promise<AuthUser | null> {
    if (this.sessionLoaded && this.user) {
      return this.user;
    }

    try {
      console.log('🔄 Loading session...');
      
      const { data: { session }, error } = await supabaseClient.auth.getSession();
      
      if (error) {
        console.error('Session error:', error);
        throw error;
      }

      if (session) {
        console.log('✅ Session found:', session.user.email);
        
        this.token = session.access_token;
        this.user = this.mapUserFromSession(session);
        this.sessionLoaded = true;

        return this.user;
      }

      console.log('ℹ️ No session found');
      this.sessionLoaded = true;
      return null;
    } catch (error) {
      console.error('❌ Load session error:', error);
      this.sessionLoaded = true;
      return null;
    }
  }

  /**
   * Map Supabase session to AuthUser
   */
  private mapUserFromSession(session: any): AuthUser {
    const user = session.user;
    
    return {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || 
            user.user_metadata?.full_name || 
            user.user_metadata?.user_name ||
            user.email?.split('@')[0] || 
            'User',
      picture: user.user_metadata?.avatar_url || 
               user.user_metadata?.picture || 
               `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
      provider: user.app_metadata?.provider || 'unknown'
    };
  }

  /**
   * Login with Google
   */
  async loginWithGoogle() {
    try {
      console.log('🔐 Initiating Google login...');
      
      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) {
        console.error('❌ Google login error:', error);
        throw error;
      }

      console.log('✅ Google OAuth initiated');
      return data;
    } catch (error) {
      console.error('❌ Google login failed:', error);
      throw error;
    }
  }

  /**
   * Login with GitHub
   */
  async loginWithGitHub() {
    try {
      console.log('🔐 Initiating GitHub login...');
      
      const { data, error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error('❌ GitHub login error:', error);
        throw error;
      }

      console.log('✅ GitHub OAuth initiated');
      return data;
    } catch (error) {
      console.error('❌ GitHub login failed:', error);
      throw error;
    }
  }

  /**
   * Handle OAuth callback
   */
  async handleCallback(): Promise<AuthUser> {
    try {
      console.log('🔄 Handling OAuth callback...');
      
      // รอให้ Supabase ประมวลผล URL hash
      await new Promise(resolve => setTimeout(resolve, 100));

      const { data: { session }, error } = await supabaseClient.auth.getSession();

      if (error) {
        console.error('❌ Session error:', error);
        throw error;
      }

      if (!session) {
        console.error('❌ No session found after callback');
        throw new Error('No session found');
      }

      console.log('✅ Session established:', {
        user: session.user.email,
        provider: session.user.app_metadata?.provider
      });

      this.token = session.access_token;
      this.user = this.mapUserFromSession(session);
      this.sessionLoaded = true;

      return this.user;
    } catch (error) {
      console.error('❌ Callback handling failed:', error);
      throw error;
    }
  }

  /**
   * Logout
   */
  async logout() {
  try {
    console.log('👋 Logging out...');
    
    await supabaseClient.auth.signOut();
    
    this.user = null;
    this.token = null;
    this.sessionLoaded = false;

    console.log('✅ Logged out successfully');
    
    // Force reload to clear all states
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  } catch (error) {
    console.error('❌ Logout error:', error);
    
    // Force clear even on error
    this.user = null;
    this.token = null;
    this.sessionLoaded = false;
    
    window.location.href = '/';
  }
}

  /**
   * Get current user
   */
  getUser(): AuthUser | null {
    return this.user;
  }

  /**
   * Get access token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.user !== null && this.token !== null;
  }

  /**
   * Clear session (for error recovery)
   */
  clearSession() {
    this.user = null;
    this.token = null;
    this.sessionLoaded = false;
  }
}

export default AuthService.getInstance();