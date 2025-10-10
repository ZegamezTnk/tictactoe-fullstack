import { useState, useCallback, useEffect, useRef } from 'react';
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

  // ใช้ ref เพื่อเก็บ timeout และ difficulty ปัจจุบัน
  const botTimeoutRef = useRef<number | null>(null);
  const currentDifficultyRef = useRef<BotDifficulty>(difficulty);

  useEffect(() => {
    console.log('🎮 Game difficulty set to:', difficulty);
    currentDifficultyRef.current = difficulty;
    
    // ยกเลิก bot move ที่กำลังรอถ้ามีการเปลี่ยน difficulty
    return () => {
      if (botTimeoutRef.current) {
        clearTimeout(botTimeoutRef.current);
        botTimeoutRef.current = null;
      }
    };
  }, [difficulty]);

  const resetGame = useCallback(() => {
    console.log('🔄 Resetting game...');
    
    // ยกเลิก bot move ที่กำลังรอ
    if (botTimeoutRef.current) {
      clearTimeout(botTimeoutRef.current);
      botTimeoutRef.current = null;
    }
    
    setGameState({
      squares: Array(9).fill(null),
      isPlayerTurn: true,
      gameOver: false,
      message: '',
      winningLine: null
    });
  }, []);

  const endGame = useCallback(async (result: any, finalSquares: SquareValue[]) => {
    console.log('🎯 endGame called:', { result, finalSquares });
    
    // ยกเลิก bot move ที่กำลังรอ
    if (botTimeoutRef.current) {
      clearTimeout(botTimeoutRef.current);
      botTimeoutRef.current = null;
    }
    
    if (result) {
      const isWin = result.winner === 'X';
      const gameResult: GameResult = isWin ? 'win' : 'loss';
      
      console.log('📤 Calling onGameEnd with:', gameResult);
      
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

        console.log('✅ Game ended. Bonus:', bonusAwarded);
      } catch (error) {
        console.error('❌ endGame error:', error);
        
        setGameState(prev => ({
          ...prev,
          squares: finalSquares,
          gameOver: true,
          winningLine: result.line,
          message: isWin ? MESSAGES.WIN : MESSAGES.LOSS
        }));
      }
    } else {
      console.log('📤 Calling onGameEnd with: draw');
      
      try {
        await onGameEnd('draw');

        setGameState(prev => ({
          ...prev,
          squares: finalSquares,
          gameOver: true,
          message: MESSAGES.DRAW
        }));

        console.log('✅ Draw ended');
      } catch (error) {
        console.error('❌ Draw error:', error);
        
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
    // ใช้ difficulty จาก ref แทนที่จะอิงจาก closure
    const activeDifficulty = currentDifficultyRef.current;
    
    console.log('🤖 Bot thinking... Difficulty:', activeDifficulty);
    console.log('📋 Board state:', currentSquares);
    
    try {
      const move = getBotMove(currentSquares, activeDifficulty);
      
      if (move === null) {
        console.error('❌ Bot returned null!');
        const fallback = currentSquares.findIndex(sq => sq === null);
        if (fallback === -1) {
          console.error('❌ No moves available!');
          return;
        }
        console.log('🔧 Using fallback move:', fallback);
        
        const newSquares = [...currentSquares];
        newSquares[fallback] = 'O';
        
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
        return;
      }
      
      console.log('✅ Bot chose move:', move);
      
      const newSquares = [...currentSquares];
      newSquares[move] = 'O';

      const result = calculateWinner(newSquares);
      if (result) {
        console.log('🎯 Bot wins!');
        endGame(result, newSquares);
        return;
      }

      if (isBoardFull(newSquares)) {
        console.log('🤝 Board full - draw');
        endGame(null, newSquares);
        return;
      }

      console.log('✅ Bot moved, player turn');
      setGameState(prev => ({
        ...prev,
        squares: newSquares,
        isPlayerTurn: true
      }));
    } catch (error) {
      console.error('❌ Bot error:', error);
      
      const emptyIndices = currentSquares
        .map((sq, idx) => sq === null ? idx : -1)
        .filter(idx => idx !== -1);
      
      if (emptyIndices.length > 0) {
        const randomMove = emptyIndices[0];
        console.log('🎲 Emergency fallback move:', randomMove);
        
        const newSquares = [...currentSquares];
        newSquares[randomMove] = 'O';
        
        setGameState(prev => ({
          ...prev,
          squares: newSquares,
          isPlayerTurn: true
        }));
      }
    }
  }, [endGame]);

  const handleSquareClick = useCallback((index: number) => {
    console.log('🎯 Click:', index, 'State:', {
      value: gameState.squares[index],
      playerTurn: gameState.isPlayerTurn,
      gameOver: gameState.gameOver
    });
    
    if (gameState.squares[index] || !gameState.isPlayerTurn || gameState.gameOver) {
      console.log('❌ Click rejected');
      return;
    }

    const newSquares = [...gameState.squares];
    newSquares[index] = 'X';
    
    console.log('✅ Player moved to:', index);

    setGameState(prev => ({
      ...prev,
      squares: newSquares,
      isPlayerTurn: false
    }));

    const result = calculateWinner(newSquares);
    if (result) {
      console.log('🏆 Player wins!');
      endGame(result, newSquares);
      return;
    }

    if (isBoardFull(newSquares)) {
      console.log('🤝 Draw!');
      endGame(null, newSquares);
      return;
    }

    console.log('⏳ Bot will move in 500ms...');
    
    // เก็บ timeout ref และยกเลิกถ้ามีการเปลี่ยน difficulty
    if (botTimeoutRef.current) {
      clearTimeout(botTimeoutRef.current);
    }
    
    botTimeoutRef.current = setTimeout(() => {
      console.log('🤖 Triggering bot move');
      botMove(newSquares);
      botTimeoutRef.current = null;
    }, 500);
  }, [gameState, botMove, endGame]);

  return {
    gameState,
    handleSquareClick,
    resetGame
  };
};