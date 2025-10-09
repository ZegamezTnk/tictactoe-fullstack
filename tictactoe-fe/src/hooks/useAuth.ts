import { useState, useEffect } from 'react';
import authService, { AuthUser } from '../services/authService';
import { supabaseClient } from '../config/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        console.log('🚀 Initializing auth...');
        
        // Load session from Supabase
        const currentUser = await authService.loadSession();
        
        if (mounted) {
          setUser(currentUser);
          console.log('✅ Auth initialized:', currentUser?.email || 'Not logged in');
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('🔔 Auth event:', event);

        try {
          switch (event) {
            case 'SIGNED_IN':
              if (session) {
                console.log('✅ User signed in:', session.user.email);
                await authService.handleCallback();
                setUser(authService.getUser());
              }
              break;

            case 'SIGNED_OUT':
              console.log('👋 User signed out');
              setUser(null);
              authService.clearSession();
              break;

            case 'TOKEN_REFRESHED':
              console.log('🔄 Token refreshed');
              // Reload session after token refresh
              const refreshedUser = await authService.loadSession();
              setUser(refreshedUser);
              break;

            case 'USER_UPDATED':
              console.log('👤 User updated');
              const updatedUser = await authService.loadSession();
              setUser(updatedUser);
              break;

            default:
              console.log('ℹ️ Auth event:', event);
          }
        } catch (error) {
          console.error('❌ Auth state change error:', error);
          setUser(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (provider: 'google' | 'github') => {
    try {
      setIsLoading(true);
      
      if (provider === 'google') {
        await authService.loginWithGoogle();
      } else if (provider === 'github') {
        await authService.loginWithGitHub();
      }
      
      // OAuth จะ redirect ไปหน้าอื่น ไม่ต้อง setIsLoading(false)
    } catch (error) {
      console.error('❌ Login error:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error('❌ Logout error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout
  };
};