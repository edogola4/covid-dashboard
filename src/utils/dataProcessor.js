import { EAST_AFRICAN_COUNTRIES } from './constants.js';

/**
 * Processes raw COVID-19 data from API
 * @param {Array} rawData - Raw data from API
 * @returns {Array} Processed data with consistent structure
 */
export const processCovidData = (rawData) => {
  if (!Array.isArray(rawData)) return [];
  
  const eastAfricanCountries = EAST_AFRICAN_COUNTRIES.map(country => country.name);
  
  return rawData
    .filter(country => eastAfricanCountries.includes(country.country))
    .map(country => {
      const countryInfo = EAST_AFRICAN_COUNTRIES.find(c => c.name === country.country);
      return {
        country: country.country,
        code: countryInfo?.code || country.countryInfo?.iso2,
        flag: countryInfo?.flag || '',
        color: countryInfo?.color || '#3b82f6',
        cases: country.cases || 0,
        deaths: country.deaths || 0,
        recovered: country.recovered || 0,
        active: country.active || 0,
        todayCases: country.todayCases || 0,
        todayDeaths: country.todayDeaths || 0,
        todayRecovered: country.todayRecovered || 0,
        population: country.population || 0,
        updated: country.updated || Date.now()
      };
    });
};

/**
 * Processes historical data for line charts
 * @param {Object} historicalData - Historical data from API
 * @returns {Array} Processed time series data
 */
export const processHistoricalData = (historicalData) => {
  if (!historicalData || !historicalData.timeline) return [];
  
  const { cases, deaths, recovered } = historicalData.timeline;
  const dates = Object.keys(cases || {});
  
  return dates.map(date => ({
    date: new Date(date),
    cases: cases[date] || 0,
    deaths: deaths[date] || 0,
    recovered: recovered[date] || 0,
    active: (cases[date] || 0) - (deaths[date] || 0) - (recovered[date] || 0)
  }));
};

/**
 * Calculates daily new cases from cumulative data
 * @param {Array} timeSeriesData - Time series data
 * @returns {Array} Daily new cases data
 */
export const calculateDailyNewCases = (timeSeriesData) => {
  if (!Array.isArray(timeSeriesData) || timeSeriesData.length < 2) return [];
  
  return timeSeriesData.map((current, index) => {
    if (index === 0) {
      return {
        ...current,
        newCases: current.cases,
        newDeaths: current.deaths,
        newRecovered: current.recovered
      };
    }
    
    const previous = timeSeriesData[index - 1];
    return {
      ...current,
      newCases: Math.max(0, current.cases - previous.cases),
      newDeaths: Math.max(0, current.deaths - previous.deaths),
      newRecovered: Math.max(0, current.recovered - previous.recovered)
    };
  });
};

/**
 * Formats numbers for display
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export const formatNumber = (num) => {
  if (typeof num !== 'number') return '0';
  
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toLocaleString();
};

/**
 * Formats date for display
 * @param {Date} date - Date to format
 * @returns {string} Formatted date
 */
export const formatDate = (date) => {
  if (!date || !(date instanceof Date)) return '';
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Calculates percentage change
 * @param {number} current - Current value
 * @param {number} previous - Previous value
 * @returns {number} Percentage change
 */
export const calculatePercentageChange = (current, previous) => {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

/**
 * Sorts countries by specified metric
 * @param {Array} countries - Array of country data
 * @param {string} metric - Metric to sort by
 * @param {string} order - Sort order ('asc' or 'desc')
 * @returns {Array} Sorted countries
 */
export const sortCountries = (countries, metric = 'cases', order = 'desc') => {
  if (!Array.isArray(countries)) return [];
  
  return [...countries].sort((a, b) => {
    const aValue = a[metric] || 0;
    const bValue = b[metric] || 0;
    
    if (order === 'asc') {
      return aValue - bValue;
    }
    return bValue - aValue;
  });
};

/**
 * Filters data by date range
 * @param {Array} data - Time series data
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Array} Filtered data
 */
export const filterByDateRange = (data, startDate, endDate) => {
  if (!Array.isArray(data) || !startDate || !endDate) return data;
  
  return data.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate >= startDate && itemDate <= endDate;
  });
};

/**
 * Validates country selection
 * @param {string} countryName - Country name to validate
 * @returns {boolean} Whether country is valid
 */
export const isValidCountry = (countryName) => {
  const validCountries = EAST_AFRICAN_COUNTRIES.map(c => c.name);
  return validCountries.includes(countryName);
};