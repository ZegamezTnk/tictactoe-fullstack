import { type PlayerData} from '../types';

const STORAGE_PREFIX = 'player_';

export const savePlayerData = (userId: string, data: PlayerData): void => {
  localStorage.setItem(
    `${STORAGE_PREFIX}${userId}`,
    JSON.stringify({
      ...data,
      lastPlayed: new Date().toISOString()
    })
  );
};

export const loadPlayerData = (userId: string): PlayerData => {
  const saved = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
  
  if (saved) {
    return JSON.parse(saved);
  }
  
  return {
    score: 0,
    winStreak: 0,
    stats: { wins: 0, losses: 0, draws: 0 },
    lastPlayed: new Date().toISOString()
  };
};

export const clearPlayerData = (userId: string): void => {
  localStorage.removeItem(`${STORAGE_PREFIX}${userId}`);
};