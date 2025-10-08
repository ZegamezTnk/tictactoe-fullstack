import React, { useState } from 'react';
import { LogOut, Trophy } from 'lucide-react';
import { Leaderboard } from './Leaderboard';

interface User {
  id: string;
  name: string;
  email?: string;
  picture?: string;
}

interface HeaderProps {
  user: User;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const userPicture = user.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`;

  return (
    <>
      <div className="bg-white rounded-lg shadow-lg p-2 sm:p-3 mb-3 sm:mb-4">
        <div className="flex items-center justify-between">
        
          <div className="flex items-center gap-2">
            <img src={userPicture} alt="Avatar" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full" />
            <div>
              <h2 className="font-bold text-gray-800 text-sm">{user.name}</h2>
              <p className="text-xs text-gray-600">Player</p>
            </div>
          </div>

         
          <div className="flex items-center gap-2">
           
            <button
              onClick={() => setShowLeaderboard(true)}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white rounded-lg transition-all shadow-md hover:shadow-lg text-xs sm:text-sm font-semibold"
            >
              <Trophy className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-200 hover:bg-red-300 rounded-lg transition-colors text-xs sm:text-sm"
            >
              <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <Leaderboard
        isOpen={showLeaderboard}
        onClose={() => setShowLeaderboard(false)}
        currentUserId={user.id}
      />
    </>
  );
};