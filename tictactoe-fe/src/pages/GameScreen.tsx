import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usePlayerStats } from '../hooks/usePlayerStats';
import { useGame } from '../hooks/useGame';
import { BotDifficulty } from '../types';
import { Header } from '../components/dashboard/Header';
import { StatsPanel } from '../components/dashboard/StatsPanel';
import { HowToPlay } from '../components/dashboard/HowToPlay';
import { Board } from '../components/game/Board';
import { GameInfo } from '../components/game/GameInfo';
import { DifficultySelector } from '../components/game/DifficultySelector';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

export const GameScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const { score, winStreak, stats, loading: statsLoading, updateStats } = usePlayerStats(user?.id);
  const [difficulty, setDifficulty] = useState<BotDifficulty>('medium');

  // Create onGameEnd wrapper
  const onGameEnd = async (result: 'win' | 'loss' | 'draw') => {
    console.log('🎮 Game ended with result:', result);
    
    try {
      // Map 'loss' to 'lose' for updateStats
      const statsResult = result === 'loss' ? 'lose' : result;
      
      await updateStats(statsResult, difficulty);
      
      // Check if bonus should be awarded (3 wins in a row)
      const bonusAwarded = result === 'win' && winStreak >= 2;
      
      return { bonusAwarded };
    } catch (error) {
      console.error('Failed to update stats:', error);
      return { bonusAwarded: false };
    }
  };

  const { gameState, handleSquareClick, resetGame } = useGame(onGameEnd, difficulty);

  const handleDifficultyChange = (newDifficulty: BotDifficulty) => {
    setDifficulty(newDifficulty);
    resetGame();
  };

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mb-4"></div>
          <div className="text-xl text-white">Loading stats...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 flex flex-col p-3 sm:p-4">
      <div className="flex-shrink-0">
        <Header user={user!} onLogout={logout} />
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

            <div className="flex-1 flex items-center justify-center my-2 sm:my-4 min-h-0">
              <Board
                squares={gameState.squares}
                winningLine={gameState.winningLine}
                onSquareClick={handleSquareClick}
                disabled={!gameState.isPlayerTurn || gameState.gameOver}
              />
            </div>

            <div className="flex-shrink-0 pb-2">
              <Button onClick={resetGame} icon={RefreshCw} fullWidth>
                New Game
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column - Stats + How to Play */}
        <div className="flex flex-col overflow-hidden min-h-0">
          <Card className="flex-1 flex flex-col overflow-hidden">
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