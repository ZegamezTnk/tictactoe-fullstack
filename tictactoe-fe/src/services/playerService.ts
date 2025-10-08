import axios from 'axios';
import { GameStats } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface PlayerData {
  user_id: string;
  name: string;
  email?: string;
  picture?: string;
  provider: string;
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

class PlayerService {
  private static instance: PlayerService;

  private constructor() {}

  static getInstance(): PlayerService {
    if (!PlayerService.instance) {
      PlayerService.instance = new PlayerService();
    }
    return PlayerService.instance;
  }

  private getAuthHeader() {
    const token = localStorage.getItem('auth_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getPlayerData(): Promise<PlayerData> {
    try {
      const { data } = await axios.get(`${API_URL}/api/player`, {
        headers: this.getAuthHeader()
      });
      return data;
    } catch (error) {
      console.error('Failed to get player data:', error);
      throw error;
    }
  }

  async updatePlayerStats(stats: {
    score: number;
    win_streak: number;
    wins: number;
    losses: number;
    draws: number;
    total_games: number;
  }): Promise<PlayerData> {
    try {
      const { data } = await axios.post(`${API_URL}/api/player/stats`, stats, {
        headers: this.getAuthHeader()
      });
      return data;
    } catch (error) {
      console.error('Failed to update player stats:', error);
      throw error;
    }
  }

  async saveGameHistory(gameData: {
    result: 'win' | 'loss' | 'draw';
    difficulty: 'easy' | 'medium' | 'hard';
    score_change: number;
  }): Promise<void> {
    try {
      await axios.post(`${API_URL}/api/player/game-history`, gameData, {
        headers: this.getAuthHeader()
      });
    } catch (error) {
      console.error('Failed to save game history:', error);
      // Don't throw - game history is optional
    }
  }

  async resetStats(): Promise<PlayerData> {
    try {
      const { data } = await axios.post(`${API_URL}/api/player/reset`, {}, {
        headers: this.getAuthHeader()
      });
      return data;
    } catch (error) {
      console.error('Failed to reset stats:', error);
      throw error;
    }
  }
}

export default PlayerService.getInstance();