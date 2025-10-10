import { useState, useEffect } from 'react';
import { supabaseClient } from '../config/supabase';
import { BotDifficulty } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

type GameResult = 'win' | 'lose' | 'draw';

interface PlayerStats {
  wins: number;
  losses: number;
  draws: number;
  easyWins: number;
  mediumWins: number;
  hardWins: number;
}

export const usePlayerStats = (userId?: string) => {
  const [score, setScore] = useState(0);
  const [winStreak, setWinStreak] = useState(0);
  const [stats, setStats] = useState<PlayerStats>({
    wins: 0,
    losses: 0,
    draws: 0,
    easyWins: 0,
    mediumWins: 0,
    hardWins: 0,
  });
  const [loading, setLoading] = useState(true);

  const getAuthToken = async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();
    return session?.access_token;
  };

  useEffect(() => {
    const loadStats = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const token = await getAuthToken();
        
        const response = await fetch(`${API_URL}/api/player/stats?userId=${userId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to load stats');

        const data = await response.json();

        setScore(data.score || 0);
        setWinStreak(data.winStreak || 0);
        setStats({
          wins: data.wins || 0,
          losses: data.losses || 0,
          draws: data.draws || 0,
          easyWins: data.easyWins || 0,
          mediumWins: data.mediumWins || 0,
          hardWins: data.hardWins || 0,
        });
      } catch (error) {
        console.error('❌ Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [userId]);

  const updateStats = async (result: GameResult, difficulty: BotDifficulty) => {
    if (!userId) return;

    try {
      const token = await getAuthToken();
      if (!token) throw new Error('No auth token');

      const response = await fetch(`${API_URL}/api/player/stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, result, difficulty }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();

      setScore(data.score || score);
      setWinStreak(data.current_win_streak || winStreak);
      setStats({
        wins: data.wins || stats.wins,
        losses: data.losses || stats.losses,
        draws: data.draws || stats.draws,
        easyWins: data.easyWins || stats.easyWins,
        mediumWins: data.mediumWins || stats.mediumWins,
        hardWins: data.hardWins || stats.hardWins,
      });
    } catch (error) {
      console.error('❌ Failed to save stats:', error);
    }
  };

  return { score, winStreak, stats, loading, updateStats };
};