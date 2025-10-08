import React from 'react';
import { LucideIcon } from 'lucide-react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  icon: Icon,
  variant = 'primary',
  fullWidth = false,
  disabled = false
}) => {
  const baseClasses = "font-semibold py-2 sm:py-2.5 px-4 sm:px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:scale-105",
    secondary: "bg-gray-200 hover:bg-red-300 text-gray-800"
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${fullWidth ? 'w-full' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};