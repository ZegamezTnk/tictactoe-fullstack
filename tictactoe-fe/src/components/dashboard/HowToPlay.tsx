import React from 'react';
import { Award } from 'lucide-react';

export const HowToPlay: React.FC = () => {
  return (
    <div>
      <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 sm:mb-3 flex items-center gap-2">
        <Award className="w-5 h-5 text-purple-500" />
        How to Play
      </h3>
      
      <div className="space-y-1.5 sm:space-y-2 text-xs text-gray-700">
        <div className="bg-blue-50 rounded-lg p-2">
          <p className="font-semibold text-blue-800 mb-0.5">🎯 Objective</p>
          <p>Get 3 in a row to win!</p>
        </div>
        
        <div className="bg-green-50 rounded-lg p-2">
          <p className="font-semibold text-green-800 mb-0.5">⭐ Scoring</p>
          <p className="mb-0.5">• Win: +1 point</p>
          <p className="mb-0.5">• Lose: -1 point</p>
          <p>• Draw: 0 points</p>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-2">
          <p className="font-semibold text-purple-800 mb-0.5">🔥 Bonus</p>
          <p>Win 3 games in a row for +1 bonus point!</p>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-2">
          <p className="font-semibold text-orange-800 mb-0.5">🤖 Difficulty</p>
          <p className="mb-0.5">• <span className="font-semibold text-green-600">Easy</span>: Random</p>
          <p className="mb-0.5">• <span className="font-semibold text-yellow-600">Medium</span>: 50% smart</p>
          <p>• <span className="font-semibold text-red-600">Hard</span>: Unbeatable</p>
        </div>
      </div>
    </div>
  );
};