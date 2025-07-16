import React from 'react';
import { formatNumber } from '../utils/dataProcessor.js';

/**
 * Statistics card component for displaying COVID-19 metrics
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {number} props.value - Main value to display
 * @param {number} props.change - Daily change value
 * @param {string} props.type - Type of metric (cases, deaths, recovered, active)
 * @param {string} props.icon - Icon component
 * @param {boolean} props.isLoading - Loading state
 */
const StatsCard = ({ 
  title, 
  value = 0, 
  change = 0, 
  type = 'cases', 
  icon,
  isLoading = false 
}) => {
  const getTypeStyles = () => {
    const styles = {
      cases: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'text-blue-600',
        value: 'text-blue-900',
        change: change > 0 ? 'text-blue-600' : 'text-gray-500'
      },
      deaths: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: 'text-red-600',
        value: 'text-red-900',
        change: change > 0 ? 'text-red-600' : 'text-gray-500'
      },
      recovered: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        icon: 'text-green-600',
        value: 'text-green-900',
        change: change > 0 ? 'text-green-600' : 'text-gray-500'
      },
      active: {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        icon: 'text-yellow-600',
        value: 'text-yellow-900',
        change: change > 0 ? 'text-yellow-600' : 'text-gray-500'
      }
    };
    return styles[type] || styles.cases;
  };

  const typeStyles = getTypeStyles();

  if (isLoading) {
    return (
      <div className={`p-6 rounded-lg border-2 ${typeStyles.bg} ${typeStyles.border}`}>
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 bg-gray-300 rounded w-20"></div>
            <div className="h-6 w-6 bg-gray-300 rounded"></div>
          </div>
          <div className="h-8 bg-gray-300 rounded w-24 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-16"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${typeStyles.bg} ${typeStyles.border}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
          {title}
        </h3>
        {icon && (
          <div className={`${typeStyles.icon}`}>
            {icon}
          </div>
        )}
      </div>

      {/* Main Value */}
      <div className={`text-3xl font-bold ${typeStyles.value} mb-2`}>
        {formatNumber(value)}
      </div>

      {/* Daily Change */}
      <div className="flex items-center">
        {change !== 0 && (
          <>
            <svg 
              className={`h-4 w-4 mr-1 ${typeStyles.change}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {change > 0 ? (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M7 17l9.2-9.2M17 17V7m0 10H7" 
                />
              ) : (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17 7l-9.2 9.2M7 7v10m0-10h10" 
                />
              )}
            </svg>
            <span className={`text-sm font-medium ${typeStyles.change}`}>
              {change > 0 ? '+' : ''}{formatNumber(change)}
            </span>
          </>
        )}
        <span className="text-xs text-gray-500 ml-2">
          {change !== 0 ? 'today' : 'no change'}
        </span>
      </div>
    </div>
  );
};

export default StatsCard;