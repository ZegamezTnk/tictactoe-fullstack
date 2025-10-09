import React, { useEffect } from 'react';
import { supabaseClient } from '../config/supabase';

export const AuthCallback: React.FC = () => {

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Handling OAuth callback...');
        
        // Get the session from Supabase
        const { data: { session }, error } = await supabaseClient.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          window.location.href = '/?error=auth_failed';
          return;
        }

        if (session) {
          console.log('Session found, redirecting to home');
          // Redirect to home page
          window.location.href = '/';
        } else {
          console.warn('No session found');
          window.location.href = '/?error=no_session';
        }
      } catch (error) {
        console.error('Callback error:', error);
        window.location.href = '/?error=callback_failed';
      }
    };

    // Small delay to ensure Supabase has processed the callback
    const timer = setTimeout(handleCallback, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4"></div>
        <div className="text-xl text-white">Completing login...</div>
        <div className="text-sm text-white opacity-75 mt-2">Please wait while we redirect you</div>
      </div>
    </div>
  );
};