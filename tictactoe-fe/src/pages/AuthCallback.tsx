import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const handleCallback = async () => {
      try {
        console.log('🔄 Processing OAuth callback...');
        setStatus('processing');

        // Handle the OAuth callback
        const user = await authService.handleCallback();

        if (!mounted) return;

        if (user) {
          console.log('✅ Authentication successful!');
          console.log('👤 User:', user.email);
          
          setStatus('success');

          // รอสักครู่แล้ว redirect
          setTimeout(() => {
            if (mounted) {
              console.log('🏠 Redirecting to home...');
              navigate('/', { replace: true });
            }
          }, 1000);
        } else {
          throw new Error('No user data received');
        }
      } catch (err: any) {
        console.error('❌ Callback error:', err);
        
        if (!mounted) return;

        setStatus('error');
        setError(err.message || 'Authentication failed');

        // Redirect to login with error after 3 seconds
        setTimeout(() => {
          if (mounted) {
            navigate('/?error=auth_failed', { replace: true });
          }
        }, 3000);
      }
    };

    handleCallback();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Authentication Failed
            </h2>
            <p className="text-white/80 mb-4">
              {error || 'Something went wrong during login'}
            </p>
            <p className="text-sm text-white/60">
              Redirecting to login page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Success!
            </h2>
            <p className="text-white/80 mb-4">
              You've been authenticated successfully
            </p>
            <p className="text-sm text-white/60">
              Redirecting to home...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Processing Authentication
          </h2>
          <p className="text-white/80">
            Please wait while we verify your credentials...
          </p>
          <div className="mt-6 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};