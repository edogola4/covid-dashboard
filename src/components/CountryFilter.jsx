import React, { useState } from 'react';
import { EAST_AFRICAN_COUNTRIES } from '../utils/constants.js';

/**
 * Country filter component for selecting countries
 * @param {Object} props - Component props
 * @param {Array} props.countries - Available countries data
 * @param {string} props.selectedCountry - Currently selected country
 * @param {Function} props.onCountrySelect - Country selection callback
 * @param {boolean} props.isLoading - Loading state
 */
const CountryFilter = ({ 
  countries = [], 
  selectedCountry, 
  onCountrySelect, 
  isLoading = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCountrySelect = (countryName) => {
    onCountrySelect(countryName);
    setIsOpen(false);
  };

  const getCountryInfo = (countryName) => {
    return EAST_AFRICAN_COUNTRIES.find(c => c.name === countryName) || {};
  };

  const selectedCountryInfo = selectedCountry ? getCountryInfo(selectedCountry) : null;

  return (
    <div className="w-full max-w-xs">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Country
      </label>
      
      <div className="relative">
        {/* Dropdown Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
          className={`
            relative w-full bg-white border border-gray-300 rounded-md shadow-sm 
            pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 
            focus:ring-primary-500 focus:border-primary-500 transition-colors duration-150
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
          `}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="flex items-center">
            {selectedCountryInfo ? (
              <>
                <span className="text-lg mr-2">{selectedCountryInfo.flag}</span>
                <span className="block truncate">{selectedCountryInfo.name}</span>
              </>
            ) : (
              <span className="block truncate text-gray-500">
                Choose a country...
              </span>
            )}
          </span>
          <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg 
              className="h-5 w-5 text-gray-400" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
          </span>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
            {/* Clear Selection Option */}
            <div
              onClick={() => handleCountrySelect(null)}
              className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-50"
            >
              <div className="flex items-center">
                <span className="text-lg mr-2">🌍</span>
                <span className="font-normal block truncate text-gray-600">
                  All Countries
                </span>
              </div>
              {!selectedCountry && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                  <svg className="h-5 w-5 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
              )}
            </div>

            {/* Country Options */}
            {countries.map((country) => {
              const countryInfo = getCountryInfo(country.country);
              const isSelected = selectedCountry === country.country;
              
              return (
                <div
                  key={country.country}
                  onClick={() => handleCountrySelect(country.country)}
                  className={`
                    cursor-pointer select-none relative py-2 pl-3 pr-9 transition-colors duration-150
                    ${isSelected ? 'bg-primary-50 text-primary-900' : 'text-gray-900 hover:bg-gray-50'}
                  `}
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{countryInfo.flag}</span>
                    <span className={`font-normal block truncate ${isSelected ? 'font-semibold' : ''}`}>
                      {country.country}
                    </span>
                  </div>
                  
                  {isSelected && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                      <svg className="h-5 w-5 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default CountryFilter;