import React from 'react';
import { Square } from './Square';
import { SquareValue } from '../../types';

interface BoardProps {
  squares: SquareValue[];
  winningLine: number[] | null;
  onSquareClick: (index: number) => void;
  disabled: boolean;
}

export const Board: React.FC<BoardProps> = ({ squares, winningLine, onSquareClick, disabled }) => {
  return (
    <div className="w-full max-w-xs sm:max-w-sm mx-auto">
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {squares.map((square, i) => (
          <Square
            key={i}
            value={square}
            onClick={() => onSquareClick(i)}
            isWinning={winningLine?.includes(i) || false}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};