import React from 'react';
import { BotDifficulty } from '../../types';
import { BOT_DIFFICULTIES } from '../../utils/constants';
import { Zap, Target, Flame } from 'lucide-react';

interface DifficultySelectorProps {
  difficulty: BotDifficulty;
  onDifficultyChange: (difficulty: BotDifficulty) => void;
  disabled?: boolean;
}

const difficultyIcons = {
  easy: Zap,
  medium: Target,
  hard: Flame
};

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  difficulty,
  onDifficultyChange,
  disabled = false
}) => {
  return (
    <div className="mb-2 sm:mb-3">
      <p className="text-xs font-semibold text-gray-700 mb-1.5 text-center">Bot Difficulty</p>
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {Object.values(BOT_DIFFICULTIES).map((config) => {
          const Icon = difficultyIcons[config.difficulty];
          const isActive = difficulty === config.difficulty;
          
          return (
            <button
              key={config.difficulty}
              onClick={() => onDifficultyChange(config.difficulty)}
              disabled={disabled}
              className={`
                relative p-2 rounded-lg transition-all duration-200 
                ${isActive 
                  ? `bg-gradient-to-r ${config.color} text-white shadow-lg scale-105` 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
              `}
            >
              <div className="flex flex-col items-center gap-0.5">
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-xs font-bold">{config.label}</span>
              </div>
              
              {isActive && (
                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-white rounded-full border-2 border-current"></div>
              )}
            </button>
          );
        })}
      </div>
      
      <p className="text-xs text-gray-500 text-center mt-1">
        {BOT_DIFFICULTIES[difficulty].description}
      </p>
    </div>
  );
};