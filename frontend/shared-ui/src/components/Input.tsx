import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  darkMode?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  darkMode = false,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
          darkMode
            ? `bg-gray-800 text-white placeholder-gray-500 border-gray-600 focus:ring-teal-500 focus:border-teal-500 ${error ? 'border-red-500' : ''}`
            : `bg-white text-gray-900 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-500' : 'border-gray-300'}`
        } ${className}`}
        {...props}
      />
      {error && (
        <p className={`mt-1 text-sm ${darkMode ? 'text-red-400' : 'text-red-600'}`}>{error}</p>
      )}
    </div>
  );
};

