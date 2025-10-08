import { SquareValue, GameResult, BotDifficulty } from '../types';
import { WINNING_LINES } from '../utils/constants';

export const calculateWinner = (squares: SquareValue[]): GameResult | null => {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a]!, line };
    }
  }
  return null;
};

export const isBoardFull = (squares: SquareValue[]): boolean => {
  return squares.every(square => square !== null);
};

const minimax = (squares: SquareValue[], isMaximizing: boolean): number => {
  const result = calculateWinner(squares);
  
  if (result) {
    return result.winner === 'O' ? 10 : -10;
  }
  
  if (isBoardFull(squares)) {
    return 0;
  }
  
  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (squares[i] === null) {
        squares[i] = 'O';
        const score = minimax(squares, false);
        squares[i] = null;
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (squares[i] === null) {
        squares[i] = 'X';
        const score = minimax(squares, true);
        squares[i] = null;
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
};


const getRandomMove = (squares: SquareValue[]): number | null => {
  const availableMoves: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (squares[i] === null) {
      availableMoves.push(i);
    }
  }
  
  if (availableMoves.length === 0) return null;
  
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
};


const getSmartMove = (squares: SquareValue[]): number | null => {
  let bestScore = -Infinity;
  let bestMove: number | null = null;
  
  for (let i = 0; i < 9; i++) {
    if (squares[i] === null) {
      squares[i] = 'O';
      const score = minimax(squares, false);
      squares[i] = null;
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  
  return bestMove;
};


export const getBotMove = (squares: SquareValue[], difficulty: BotDifficulty = 'hard'): number | null => {
  switch (difficulty) {
    case 'easy':
      
      return getRandomMove(squares);
      
    case 'medium':
     
      return Math.random() < 0.5 ? getSmartMove(squares) : getRandomMove(squares);
      
    case 'hard':
    default:
      
      return getSmartMove(squares);
  }
};