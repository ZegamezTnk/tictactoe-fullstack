import { useState, useCallback } from 'react';
import { SquareValue, GameState, BotDifficulty } from '../types';
import { calculateWinner, getBotMove, isBoardFull } from '../services/gameService';
import { MESSAGES } from '../utils/constants';

export const useGame = (
  onGameEnd: (result: 'win' | 'loss' | 'draw') => Promise<{ bonusAwarded: boolean }>,
  difficulty: BotDifficulty = 'medium'
) => {
  const [gameState, setGameState] = useState<GameState>({
    squares: Array(9).fill(null),
    isPlayerTurn: true,
    gameOver: false,
    message: '',
    winningLine: null
  });


  useState(() => {
    localStorage.setItem('current_difficulty', difficulty);
  });

  const resetGame = useCallback(() => {
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
      const gameResult = isWin ? 'win' : 'loss';
      
     
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
    } else {
      await onGameEnd('draw');
      setGameState(prev => ({
        ...prev,
        squares: finalSquares,
        gameOver: true,
        message: MESSAGES.DRAW
      }));
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