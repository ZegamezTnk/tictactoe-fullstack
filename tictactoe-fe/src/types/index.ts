export interface User {
  id: string;
  name: string;
  email?: string;
  picture: string;
}

export interface GameStats {
  wins: number;
  losses: number;
  draws: number;
}

export interface PlayerData {
  score: number;
  winStreak: number;
  stats: GameStats;
  lastPlayed: string;
}

export type SquareValue = 'X' | 'O' | null;

export interface GameResult {
  winner: SquareValue;
  line: number[];
}

export interface GameState {
  squares: SquareValue[];
  isPlayerTurn: boolean;
  gameOver: boolean;
  message: string;
  winningLine: number[] | null;
}

export type BotDifficulty = 'easy' | 'medium' | 'hard';

export interface BotConfig {
  difficulty: BotDifficulty;
  label: string;
  description: string;
  color: string;
}