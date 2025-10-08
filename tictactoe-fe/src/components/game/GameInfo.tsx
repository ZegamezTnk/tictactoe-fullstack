import React from 'react';

interface GameInfoProps {
  message: string;
  isPlayerTurn: boolean;
  gameOver: boolean;
}

export const GameInfo: React.FC<GameInfoProps> = ({ message, isPlayerTurn, gameOver }) => {
  return (
    <div className="text-center mb-2 sm:mb-3">
      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-1 sm:mb-2">Tic-Tac-Toe</h3>
      
      {message ? (
        <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-2 mb-2">
          <p className="font-bold text-gray-800 text-xs sm:text-sm">{message}</p>
        </div>
      ) : (
        !gameOver && (
          <p className="text-gray-600 text-xs sm:text-sm py-2">
            {isPlayerTurn ? "Your turn (X)" : "Bot's turn (O)..."}
          </p>
        )
      )}
    </div>
  );
};