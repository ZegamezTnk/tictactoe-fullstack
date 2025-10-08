import { useState, useEffect } from 'react';
import authService, { AuthUser } from '../services/authService';
import { supabaseClient } from '../config/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    const initAuth = async () => {
      const currentUser = authService.getUser();
      setUser(currentUser);
      setIsLoading(false);
    };

    initAuth();

   
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          await authService.handleCallback();
          setUser(authService.getUser());
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (provider: 'google' | 'github') => {
    if (provider === 'google') {
      await authService.loginWithGoogle();
    } else if (provider === 'github') {
      await authService.loginWithGitHub();
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout
  };
};