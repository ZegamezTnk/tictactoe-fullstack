import React from 'react';
import { Trophy, TrendingUp } from 'lucide-react';
import { GameStats } from '../../types';

interface StatsPanelProps {
  score: number;
  winStreak: number;
  stats: GameStats;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ score, winStreak, stats }) => {
  return (
    <div>
      <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-500" />
        Your Stats
      </h3>
      
      <div className="space-y-2 sm:space-y-3">
        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg p-2.5 sm:p-3 text-white">
          <p className="text-xs opacity-90">Total Score</p>
          <p className="text-2xl sm:text-3xl font-bold">{score}</p>
        </div>
        
        <div className="bg-gradient-to-r from-green-400 to-emerald-400 rounded-lg p-2.5 sm:p-3 text-white">
          <p className="text-xs opacity-90 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Win Streak
          </p>
          <p className="text-2xl sm:text-3xl font-bold">{winStreak}/3</p>
        </div>
        
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
          <div className="bg-green-100 rounded-lg p-2">
            <p className="text-xl sm:text-2xl font-bold text-green-600">{stats.wins}</p>
            <p className="text-xs text-gray-600">Wins</p>
          </div>
          <div className="bg-red-100 rounded-lg p-2">
            <p className="text-xl sm:text-2xl font-bold text-red-600">{stats.losses}</p>
            <p className="text-xs text-gray-600">Losses</p>
          </div>
          <div className="bg-gray-100 rounded-lg p-2">
            <p className="text-xl sm:text-2xl font-bold text-gray-600">{stats.draws}</p>
            <p className="text-xs text-gray-600">Draws</p>
          </div>
        </div>
      </div>
    </div>
  );
};