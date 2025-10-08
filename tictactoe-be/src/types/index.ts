export interface Player {
  id: string;
  user_id: string;
  provider: string;
  email: string;
  name: string;
  picture?: string;
  score: number;
  win_streak: number;
  wins: number;
  losses: number;
  draws: number;
  total_games: number;
  last_played: string;
  created_at: string;
  updated_at: string;
}

export interface GameHistory {
  id: string;
  player_id: string;
  result: 'win' | 'loss' | 'draw';
  difficulty: 'easy' | 'medium' | 'hard';
  score_change: number;
  played_at: string;
}

export interface UpdateStatsRequest {
  score: number;
  win_streak: number;
  wins: number;
  losses: number;
  draws: number;
  total_games: number;
}