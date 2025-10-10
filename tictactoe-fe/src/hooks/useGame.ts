import { useState, useCallback, useEffect } from 'react';
import { SquareValue, GameState, BotDifficulty } from '../types';
import { calculateWinner, getBotMove, isBoardFull } from '../services/gameService';
import { MESSAGES } from '../utils/constants';

interface GameEndResult {
  bonusAwarded: boolean;
}

type GameResult = 'win' | 'loss' | 'draw';

export const useGame = (
  onGameEnd: (result: GameResult) => Promise<GameEndResult>,
  difficulty: BotDifficulty = 'medium'
) => {
  const [gameState, setGameState] = useState<GameState>({
    squares: Array(9).fill(null),
    isPlayerTurn: true,
    gameOver: false,
    message: '',
    winningLine: null
  });

  // Save difficulty to memory (not localStorage - artifacts don't support it)
  useEffect(() => {
    console.log('🎮 Game difficulty set to:', difficulty);
  }, [difficulty]);

  const resetGame = useCallback(() => {
    console.log('🔄 Resetting game...');
    setGameState({
      squares: Array(9).fill(null),
      isPlayerTurn: true,
      gameOver: false,
      message: '',
      winningLine: null
    });
  }, []);

  const endGame = useCallback(async (result: any, finalSquares: SquareValue[]) => {
    if (result) {
      const isWin = result.winner === 'X';
      const gameResult: GameResult = isWin ? 'win' : 'loss';
      
      console.log(`🎯 Game ended: ${gameResult}`);
      
      try {
        const { bonusAwarded } = await onGameEnd(gameResult);

        setGameState(prev => ({
          ...prev,
          squares: finalSquares,
          gameOver: true,
          winningLine: result.line,
          message: isWin 
            ? (bonusAwarded ? MESSAGES.BONUS : MESSAGES.WIN)
            : MESSAGES.LOSS
        }));

        console.log(`✅ Stats updated. Bonus: ${bonusAwarded}`);
      } catch (error) {
        console.error('❌ Failed to update stats:', error);
        
        // Still show game result even if stats fail
        setGameState(prev => ({
          ...prev,
          squares: finalSquares,
          gameOver: true,
          winningLine: result.line,
          message: isWin ? MESSAGES.WIN : MESSAGES.LOSS
        }));
      }
    } else {
      console.log('🤝 Game ended: draw');
      
      try {
        await onGameEnd('draw');

        setGameState(prev => ({
          ...prev,
          squares: finalSquares,
          gameOver: true,
          message: MESSAGES.DRAW
        }));

        console.log('✅ Draw stats updated');
      } catch (error) {
        console.error('❌ Failed to update draw stats:', error);
        
        setGameState(prev => ({
          ...prev,
          squares: finalSquares,
          gameOver: true,
          message: MESSAGES.DRAW
        }));
      }
    }
  }, [onGameEnd]);

  const botMove = useCallback((currentSquares: SquareValue[]) => {
    const move = getBotMove(currentSquares, difficulty);
    if (move !== null) {
      const newSquares = [...currentSquares];
      newSquares[move] = 'O';

      const result = calculateWinner(newSquares);
      if (result) {
        endGame(result, newSquares);
        return;
      }

      if (isBoardFull(newSquares)) {
        endGame(null, newSquares);
        return;
      }

      setGameState(prev => ({
        ...prev,
        squares: newSquares,
        isPlayerTurn: true
      }));
    }
  }, [endGame, difficulty]);

  const handleSquareClick = useCallback((index: number) => {
    if (gameState.squares[index] || !gameState.isPlayerTurn || gameState.gameOver) {
      return;
    }

    const newSquares = [...gameState.squares];
    newSquares[index] = 'X';

    setGameState(prev => ({
      ...prev,
      squares: newSquares,
      isPlayerTurn: false
    }));

    const result = calculateWinner(newSquares);
    if (result) {
      endGame(result, newSquares);
      return;
    }

    if (isBoardFull(newSquares)) {
      endGame(null, newSquares);
      return;
    }

    setTimeout(() => botMove(newSquares), 500);
  }, [gameState, botMove, endGame]);

  return {
    gameState,
    handleSquareClick,
    resetGame
  };
};