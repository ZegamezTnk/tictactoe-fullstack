import { BotConfig } from '../types';

export const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6] // cross
];

export const SCORES = {
  WIN: 1,
  LOSS: -1,
  DRAW: 0,
  BONUS_STREAK: 1,
  BONUS_THRESHOLD: 3
};

export const MESSAGES = {
  WIN: '🎊 YOU WIN! +1 Point',
  LOSS: '😢 BOT WINS! -1 Point',
  DRAW: "🤝 IT'S A DRAW!",
  BONUS: '🎉 3 WINS IN A ROW! +1 BONUS POINT!'
};

export const BOT_DIFFICULTIES: Record<string, BotConfig> = {
  easy: {
    difficulty: 'easy',
    label: 'Easy',
    description: 'Bot plays randomly',
    color: 'from-green-400 to-emerald-400'
  },
  medium: {
    difficulty: 'medium',
    label: 'Medium',
    description: '50% smart moves',
    color: 'from-yellow-400 to-orange-400'
  },
  hard: {
    difficulty: 'hard',
    label: 'Hard',
    description: 'Unbeatable AI',
    color: 'from-red-400 to-pink-400'
  }
};