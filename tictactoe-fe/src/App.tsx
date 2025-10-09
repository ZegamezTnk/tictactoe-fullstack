import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { usePlayerStats } from './hooks/usePlayerStats';
import { useGame } from './hooks/useGame';
import { BotDifficulty } from './types';
import { LoginScreen } from './components/auth/LoginScreen';
import { Header } from './components/dashboard/Header';
import { StatsPanel } from './components/dashboard/StatsPanel';
import { HowToPlay } from './components/dashboard/HowToPlay';
import { Board } from './components/game/Board';
import { GameInfo } from './components/game/GameInfo';
import { DifficultySelector } from './components/game/DifficultySelector';
import { Button } from './components/common/Button';
import { Card } from './components/common/Card';
import authService from './services/authService';

const App: React.FC = () => {
  const { user, isLoading: authLoading,logout } = useAuth();
  const { score, winStreak, stats, loading: statsLoading, updateStats } = usePlayerStats(user?.id);
  const [difficulty, setDifficulty] = useState<BotDifficulty>('medium');
  const { gameState, handleSquareClick, resetGame } = useGame(updateStats, difficulty);
  const [isProcessingCallback, setIsProcessingCallback] = useState(false);

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const hash = window.location.hash;
      const urlParams = new URLSearchParams(window.location.search);
      
      if (hash || urlParams.has('code') || urlParams.has('access_token')) {
        console.log('🔄 Processing OAuth callback...');
        setIsProcessingCallback(true);
        
        try {
          await authService.handleCallback();
          console.log('✅ Callback processed successfully');
          
          // Clean URL after successful callback
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('❌ Callback error:', error);
        } finally {
          setTimeout(() => {
            setIsProcessingCallback(false);
          }, 500);
        }
      }
    };

    handleOAuthCallback();
  }, []);

  const handleDifficultyChange = (newDifficulty: BotDifficulty) => {
    setDifficulty(newDifficulty);
    resetGame();
  };

  // Loading state with timeout
  useEffect(() => {
    // Timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (authLoading) {
        console.warn('⚠️ Auth loading timeout - forcing to show login screen');
        window.location.reload();
      }
    }, 5000); // 5 seconds timeout

    return () => clearTimeout(timeout);
  }, [authLoading]);

  // Loading state
  if (authLoading || statsLoading || isProcessingCallback) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4"></div>
          <div className="text-xl text-white">
            {isProcessingCallback ? 'Processing authentication...' : 'Loading...'}
          </div>
          <div className="text-sm text-white/60 mt-2">
            {authLoading && 'Checking authentication...'}
            {statsLoading && 'Loading stats...'}
          </div>
        </div>
      </div>
    );
  }

  // Login screen
  if (!user) {
    return <LoginScreen />;
  }

  // Game screen
  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 flex flex-col p-3 sm:p-4">
      <div className="flex-shrink-0">
        <Header user={user} onLogout={logout} />
      </div>

      <div className="flex-1 grid lg:grid-cols-2 gap-3 sm:gap-4 overflow-hidden min-h-0">
        
        {/* Left Column - Game Board */}
        <div className="flex flex-col overflow-hidden min-h-0">
          <Card className="flex-1 flex flex-col overflow-hidden">
            <GameInfo
              message={gameState.message}
              isPlayerTurn={gameState.isPlayerTurn}
              gameOver={gameState.gameOver}
            />

            <DifficultySelector
              difficulty={difficulty}
              onDifficultyChange={handleDifficultyChange}
              disabled={!gameState.gameOver && gameState.squares.some(s => s !== null)}
            />

            <div className="flex-1 flex items-center justify-center my-2 sm:my-4">
              <Board
                squares={gameState.squares}
                winningLine={gameState.winningLine}
                onSquareClick={handleSquareClick}
                disabled={!gameState.isPlayerTurn || gameState.gameOver}
              />
            </div>

            <div className="flex-shrink-0">
              <Button onClick={resetGame} icon={RefreshCw} fullWidth>
                New Game
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column - Stats + How to Play */}
        <div className="flex flex-col overflow-hidden">
          <Card className="flex-1 flex flex-col overflow-y-auto">
            <div className="flex-shrink-0 mb-4">
              <StatsPanel score={score} winStreak={winStreak} stats={stats} />
            </div>

            <div className="flex-shrink-0 border-t border-gray-200 my-3"></div>

            <div className="flex-1 overflow-y-auto">
              <HowToPlay />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default App;