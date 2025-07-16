import React from 'react';
import { formatDate } from '../utils/dataProcessor.js';

/**
 * Header component for the COVID-19 dashboard
 * @param {Object} props - Component props
 * @param {Date} props.lastUpdated - Last update timestamp
 * @param {Function} props.onRefresh - Refresh callback function
 * @param {boolean} props.isLoading - Loading state
 */
const Header = ({ lastUpdated, onRefresh, isLoading = false }) => {
  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <svg 
                  className="h-5 w-5 text-white" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  COVID-19 Dashboard
                </h1>
                <p className="text-sm text-gray-500">
                  East African Countries
                </p>
              </div>
            </div>
          </div>

          {/* Status and Controls */}
          <div className="flex items-center space-x-4">
            {/* Last Updated */}
            {lastUpdated && (
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs text-gray-500">Last Updated</span>
                <span className="text-sm font-medium text-gray-700">
                  {formatDate(lastUpdated)}
                </span>
              </div>
            )}

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className={`
                inline-flex items-center px-3 py-2 border border-transparent text-sm 
                leading-4 font-medium rounded-md text-white transition-colors duration-150
                ${isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                }
              `}
              aria-label="Refresh data"
            >
              <svg 
                className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Last Updated */}
      {lastUpdated && (
        <div className="sm:hidden bg-gray-50 px-4 py-2 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Last Updated:</span>
            <span className="font-medium text-gray-700">
              {formatDate(lastUpdated)}
            </span>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;