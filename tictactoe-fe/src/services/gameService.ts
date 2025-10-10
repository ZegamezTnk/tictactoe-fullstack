import { SquareValue, BotDifficulty } from '../types';

// Calculate winner
export const calculateWinner = (
  squares: SquareValue[]
): { winner: 'X' | 'O'; line: number[] } | null => {
  const lines = [
    [0, 1, 2], // Top row
    [3, 4, 5], // Middle row
    [6, 7, 8], // Bottom row
    [0, 3, 6], // Left column
    [1, 4, 7], // Middle column
    [2, 5, 8], // Right column
    [0, 4, 8], // Diagonal \
    [2, 4, 6], // Diagonal /
  ];

  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a] as 'X' | 'O', line: [a, b, c] };
    }
  }

  return null;
};

// Check if board is full
export const isBoardFull = (squares: SquareValue[]): boolean => {
  return squares.every((square) => square !== null);
};

// Get bot move based on difficulty
export const getBotMove = (
  board: SquareValue[],
  difficulty: BotDifficulty
): number | null => {
  console.log('🎮 getBotMove called');
  console.log('  Difficulty:', difficulty);
  console.log('  Board:', board);
  
  const emptyIndices = board
    .map((value, index) => (value === null ? index : -1))
    .filter((index) => index !== -1);

  console.log('  Empty squares:', emptyIndices);

  if (emptyIndices.length === 0) {
    console.warn('⚠️ No empty squares!');
    return null;
  }

  try {
    switch (difficulty) {
      case 'easy':
        return getEasyMove(emptyIndices);
      
      case 'medium':
        return getMediumMove(board, emptyIndices);
      
      case 'hard':
        return getHardMove(board, emptyIndices);
      
      default:
        console.warn('⚠️ Unknown difficulty, using easy');
        return getEasyMove(emptyIndices);
    }
  } catch (error) {
    console.error('❌ getBotMove error:', error);
    return emptyIndices[0]; // Fallback
  }
};

// Easy mode: Random move
function getEasyMove(emptyIndices: number[]): number {
  const move = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  console.log('✅ Easy mode: random move', move);
  return move;
}

// Medium mode: 50% smart, 50% random
function getMediumMove(board: SquareValue[], emptyIndices: number[]): number {
  const shouldBeSmart = Math.random() < 0.5;
  
  if (shouldBeSmart) {
    console.log('🧠 Medium mode: trying smart move');
    try {
      const result = minimax(board, 'O', 0, -Infinity, Infinity, 3); // Limit depth to 3
      if (result.index !== null && result.index !== undefined) {
        console.log('✅ Medium mode: smart move', result.index);
        return result.index;
      }
    } catch (error) {
      console.warn('⚠️ Minimax failed, using random', error);
    }
  }
  
  const move = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  console.log('🎲 Medium mode: random move', move);
  return move;
}

// Hard mode: Full minimax with timeout
function getHardMove(board: SquareValue[], emptyIndices: number[]): number {
  console.log('💪 Hard mode: full minimax');
  
  try {
    const startTime = Date.now();
    const maxDepth = emptyIndices.length > 6 ? 6 : 9; // Limit depth for large boards
    
    const result = minimax(board, 'O', 0, -Infinity, Infinity, maxDepth);
    
    const elapsed = Date.now() - startTime;
    console.log(`⏱️ Minimax took ${elapsed}ms`);
    
    if (result.index !== null && result.index !== undefined) {
      console.log('✅ Hard mode: best move', result.index);
      return result.index;
    }
    
    console.warn('⚠️ Minimax returned null, using fallback');
  } catch (error) {
    console.error('❌ Hard mode error:', error);
  }
  
  return emptyIndices[0]; // Fallback
}

// Minimax algorithm with alpha-beta pruning
function minimax(
  board: SquareValue[],
  player: 'X' | 'O',
  depth: number,
  alpha: number,
  beta: number,
  maxDepth: number = 9
): { score: number; index: number | null } {
  // Check depth limit
  if (depth > maxDepth) {
    return { score: 0, index: null };
  }

  // Check terminal states
  const winner = calculateWinner(board);
  if (winner) {
    if (winner.winner === 'O') {
      return { score: 10 - depth, index: null }; // Bot wins
    } else {
      return { score: depth - 10, index: null }; // Player wins
    }
  }

  if (isBoardFull(board)) {
    return { score: 0, index: null }; // Draw
  }

  const emptyIndices = board
    .map((value, index) => (value === null ? index : -1))
    .filter((index) => index !== -1);

  if (player === 'O') {
    // Maximizing player (Bot)
    let bestScore = -Infinity;
    let bestMove: number | null = null;

    for (const index of emptyIndices) {
      const newBoard = [...board];
      newBoard[index] = 'O';

      const result = minimax(newBoard, 'X', depth + 1, alpha, beta, maxDepth);

      if (result.score > bestScore) {
        bestScore = result.score;
        bestMove = index;
      }

      alpha = Math.max(alpha, bestScore);
      
      // Alpha-beta pruning
      if (beta <= alpha) {
        break;
      }
    }

    return { score: bestScore, index: bestMove };
  } else {
    // Minimizing player (Human)
    let bestScore = Infinity;
    let bestMove: number | null = null;

    for (const index of emptyIndices) {
      const newBoard = [...board];
      newBoard[index] = 'X';

      const result = minimax(newBoard, 'O', depth + 1, alpha, beta, maxDepth);

      if (result.score < bestScore) {
        bestScore = result.score;
        bestMove = index;
      }

      beta = Math.min(beta, bestScore);
      
      // Alpha-beta pruning
      if (beta <= alpha) {
        break;
      }
    }

    return { score: bestScore, index: bestMove };
  }
}