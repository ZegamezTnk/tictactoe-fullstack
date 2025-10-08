import React from 'react';
import { SquareValue } from '../../types';

interface SquareProps {
  value: SquareValue;
  onClick: () => void;
  isWinning: boolean;
  disabled: boolean;
}

export const Square: React.FC<SquareProps> = ({ value, onClick, isWinning, disabled }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        aspect-square w-full text-3xl sm:text-4xl font-bold rounded-lg transition-all duration-200
        ${value === 'X' ? 'text-blue-600' : 'text-red-500'}
        ${isWinning ? 'bg-yellow-200 scale-105' : 'bg-white hover:bg-gray-50'}
        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
        shadow-md hover:shadow-lg
        flex items-center justify-center
      `}
    >
      {value}
    </button>
  );
};