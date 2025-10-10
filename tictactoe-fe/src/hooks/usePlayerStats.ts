import { useState, useEffect, useCallback } from 'react';
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
    try {
      const { data: { session }, error } = await supabaseClient.auth.getSession();
      
      if (error) {
        console.error('Get session error:', error);
        const { data: refreshData } = await supabaseClient.auth.refreshSession();
        return refreshData.session?.access_token;
      }
      
      if (!session?.access_token) {
        console.warn('⚠️ No access token - attempting refresh...');
        const { data: refreshData } = await supabaseClient.auth.refreshSession();
        return refreshData.session?.access_token;
      }
      
      return session.access_token;
    } catch (error) {
      console.error('❌ Failed to get auth token:', error);
      return null;
    }
  };

  // Load stats function
  const loadStats = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      console.log('📊 Loading stats for user:', userId);
      
      const token = await getAuthToken();
      
      const response = await fetch(`${API_URL}/api/player/stats?userId=${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load stats');

      const data = await response.json();
      console.log('✅ Stats loaded:', data);

      setScore(data.score || 0);
      setWinStreak(data.current_win_streak || 0);
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
  }, [userId]);

  // Initial load
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Update stats
  const updateStats = async (result: GameResult, difficulty: BotDifficulty) => {
    if (!userId) return;

    try {
      console.log('💾 Saving stats:', { result, difficulty, userId });

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
      console.log('✅ Stats saved:', data);

      // ✅ Update local state immediately
      setScore(data.score || 0);
      setWinStreak(data.current_win_streak || 0);
      setStats({
        wins: data.wins || 0,
        losses: data.losses || 0,
        draws: data.draws || 0,
        easyWins: data.easyWins || 0,
        mediumWins: data.mediumWins || 0,
        hardWins: data.hardWins || 0,
      });

      // ✅ Refresh from server to ensure consistency
      setTimeout(() => {
        loadStats();
      }, 500);

    } catch (error) {
      console.error('❌ Failed to save stats:', error);
    }
  };

  return { score, winStreak, stats, loading, updateStats, refreshStats: loadStats };
};