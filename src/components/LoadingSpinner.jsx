import React from 'react';

/**
 * Loading spinner component with customizable size and message
 * @param {Object} props - Component props
 * @param {string} props.size - Size of spinner ('sm', 'md', 'lg')
 * @param {string} props.message - Loading message to display
 * @param {string} props.className - Additional CSS classes
 */
const LoadingSpinner = ({ 
  size = 'md', 
  message = 'Loading...', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const containerClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className={`animate-spin rounded-full border-4 border-gray-200 border-t-primary-600 ${sizeClasses[size]}`} />
      {message && (
        <p className={`mt-4 text-gray-600 font-medium ${containerClasses[size]}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;