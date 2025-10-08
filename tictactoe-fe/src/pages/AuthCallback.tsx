import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseClient } from '../config/supabase';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle OAuth callback
    const handleCallback = async () => {
      try {
        // Get session from URL hash
        const { data: { session }, error } = await supabaseClient.auth.getSession();

        if (error) {
          console.error('Auth callback error:', error);
          navigate('/?error=auth_failed');
          return;
        }

        if (session) {
          // Save token to localStorage
          localStorage.setItem('auth_token', session.access_token);
          
          // Redirect to home
          navigate('/');
        } else {
          navigate('/?error=no_session');
        }
      } catch (error) {
        console.error('Callback error:', error);
        navigate('/?error=callback_failed');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600">
      <div className="text-white text-xl">
        Completing login...
      </div>
    </div>
  );
};