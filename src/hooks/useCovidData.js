import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_CONFIG, LOADING_STATES, ERROR_MESSAGES } from '../utils/constants.js';
import { processCovidData, processHistoricalData } from '../utils/dataProcessor.js';
import mockData from '../data/mockData.json';

/**
 * Custom hook for fetching and managing COVID-19 data
 * @returns {Object} Hook state and functions
 */
export const useCovidData = () => {
  const [state, setState] = useState({
    countries: [],
    historicalData: {},
    selectedCountry: null,
    loadingState: LOADING_STATES.IDLE,
    error: null,
    lastUpdated: null
  });

  /**
   * Updates the state with new data
   * @param {Object} updates - State updates
   */
  const updateState = useCallback((updates) => {
    setState(prevState => ({
      ...prevState,
      ...updates
    }));
  }, []);

  /**
   * Fetches current COVID-19 data for all countries
   */
  const fetchCountriesData = useCallback(async () => {
    try {
      updateState({ loadingState: LOADING_STATES.LOADING, error: null });
      
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.COUNTRIES}`,
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && Array.isArray(response.data)) {
        const processedData = processCovidData(response.data);
        updateState({
          countries: processedData,
          loadingState: LOADING_STATES.SUCCESS,
          lastUpdated: new Date(),
          error: null
        });
      } else {
        throw new Error('Invalid data format received');
      }
    } catch (error) {
      console.warn('API fetch failed, using mock data:', error.message);
      
      // Fallback to mock data
      const processedData = processCovidData(mockData.countries);
      updateState({
        countries: processedData,
        loadingState: LOADING_STATES.SUCCESS,
        lastUpdated: new Date(),
        error: ERROR_MESSAGES.API_ERROR
      });
    }
  }, [updateState]);

  /**
   * Fetches historical data for a specific country
   * @param {string} countryName - Name of the country
   */
  const fetchHistoricalData = useCallback(async (countryName) => {
    if (!countryName) return;

    try {
      updateState({ loadingState: LOADING_STATES.LOADING });
      
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HISTORICAL}/${countryName}?lastdays=30`,
        {
          timeout: 10000,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && response.data.timeline) {
        const processedData = processHistoricalData(response.data);
        updateState(prevState => ({
          historicalData: {
            ...prevState.historicalData,
            [countryName]: processedData
          },
          loadingState: LOADING_STATES.SUCCESS
        }));
      } else {
        throw new Error('Invalid historical data format');
      }
    } catch (error) {
      console.warn(`Historical data fetch failed for ${countryName}, using mock data:`, error.message);
      
      // Fallback to mock data
      const mockHistoricalData = mockData.historicalData[countryName];
      if (mockHistoricalData) {
        const processedData = processHistoricalData(mockHistoricalData);
        updateState(prevState => ({
          historicalData: {
            ...prevState.historicalData,
            [countryName]: processedData
          },
          loadingState: LOADING_STATES.SUCCESS
        }));
      } else {
        updateState({
          loadingState: LOADING_STATES.ERROR,
          error: `${ERROR_MESSAGES.NO_DATA} for ${countryName}`
        });
      }
    }
  }, [updateState]);

  /**
   * Sets the selected country for detailed view
   * @param {string} countryName - Name of the country to select
   */
  const setSelectedCountry = useCallback((countryName) => {
    updateState({ selectedCountry: countryName });
    if (countryName && !state.historicalData[countryName]) {
      fetchHistoricalData(countryName);
    }
  }, [state.historicalData, fetchHistoricalData, updateState]);

  /**
   * Refreshes all data
   */
  const refreshData = useCallback(() => {
    fetchCountriesData();
    if (state.selectedCountry) {
      fetchHistoricalData(state.selectedCountry);
    }
  }, [fetchCountriesData, fetchHistoricalData, state.selectedCountry]);

  /**
   * Clears error state
   */
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Initial data fetch
  useEffect(() => {
    fetchCountriesData();
  }, [fetchCountriesData]);

  // Auto-refresh data every 10 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshData();
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [refreshData]);

  return {
    // State
    countries: state.countries,
    historicalData: state.historicalData,
    selectedCountry: state.selectedCountry,
    loadingState: state.loadingState,
    error: state.error,
    lastUpdated: state.lastUpdated,
    
    // Actions
    setSelectedCountry,
    fetchHistoricalData,
    refreshData,
    clearError,
    
    // Computed values
    isLoading: state.loadingState === LOADING_STATES.LOADING,
    hasError: !!state.error,
    hasData: state.countries.length > 0
  };
};