import { useState, useEffect } from 'react';
import { GameStats } from '../types';
import playerService, { PlayerData } from '../services/playerService';
import { SCORES } from '../utils/constants';

export const usePlayerStats = (userId: string | undefined) => {
  const [score, setScore] = useState(0);
  const [winStreak, setWinStreak] = useState(0);
  const [stats, setStats] = useState<GameStats>({ wins: 0, losses: 0, draws: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      loadPlayerData();
    } else {
      setLoading(false);
    }
  }, [userId]);

  const loadPlayerData = async () => {
    try {
      setLoading(true);
      const data = await playerService.getPlayerData();
      
      setScore(data.score);
      setWinStreak(data.win_streak);
      setStats({
        wins: data.wins,
        losses: data.losses,
        draws: data.draws
      });
    } catch (error) {
      console.error('Failed to load player data:', error);
      // Set defaults on error
      setScore(0);
      setWinStreak(0);
      setStats({ wins: 0, losses: 0, draws: 0 });
    } finally {
      setLoading(false);
    }
  };

  const updateStats = async (result: 'win' | 'loss' | 'draw'): Promise<{ score: number; bonusAwarded: boolean }> => {
    let newScore = score;
    let newStreak = winStreak;
    let newStats = { ...stats };
    let bonusAwarded = false;
    let scoreChange = 0;

    if (result === 'win') {
      scoreChange = SCORES.WIN;
      newScore += scoreChange;
      newStreak += 1;
      newStats.wins += 1;

      if (newStreak === SCORES.BONUS_THRESHOLD) {
        scoreChange += SCORES.BONUS_STREAK;
        newScore += SCORES.BONUS_STREAK;
        bonusAwarded = true;
        newStreak = 0;
      }
    } else if (result === 'loss') {
      scoreChange = SCORES.LOSS;
      newScore += scoreChange;
      newStreak = 0;
      newStats.losses += 1;
    } else {
      scoreChange = 0;
      newStreak = 0;
      newStats.draws += 1;
    }

    const totalGames = newStats.wins + newStats.losses + newStats.draws;

  
    setScore(newScore);
    setWinStreak(newStreak);
    setStats(newStats);

   
    try {
      await playerService.updatePlayerStats({
        score: newScore,
        win_streak: newStreak,
        wins: newStats.wins,
        losses: newStats.losses,
        draws: newStats.draws,
        total_games: totalGames
      });

     
      const difficulty = localStorage.getItem('current_difficulty') as 'easy' | 'medium' | 'hard' || 'medium';
      await playerService.saveGameHistory({
        result,
        difficulty,
        score_change: scoreChange
      });
    } catch (error) {
      console.error('Failed to save stats:', error);
      // Could add error notification here
    }

    return { score: newScore, bonusAwarded };
  };

  const resetStats = async () => {
    try {
      const data = await playerService.resetStats();
      setScore(data.score);
      setWinStreak(data.win_streak);
      setStats({
        wins: data.wins,
        losses: data.losses,
        draws: data.draws
      });
    } catch (error) {
      console.error('Failed to reset stats:', error);
    }
  };

  return {
    score,
    winStreak,
    stats,
    loading,
    updateStats,
    resetStats,
    refresh: loadPlayerData
  };
};