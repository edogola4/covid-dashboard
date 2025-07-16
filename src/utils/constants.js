// API Configuration
export const API_CONFIG = {
    BASE_URL: 'https://disease.sh/v3/covid-19',
    ENDPOINTS: {
      COUNTRIES: '/countries',
      HISTORICAL: '/historical'
    }
  };
  
  // East African Countries
  export const EAST_AFRICAN_COUNTRIES = [
    {
      name: 'Kenya',
      code: 'KE',
      flag: '🇰🇪',
      color: '#dc2626'
    },
    {
      name: 'Uganda',
      code: 'UG',
      flag: '🇺🇬',
      color: '#2563eb'
    },
    {
      name: 'Tanzania',
      code: 'TZ',
      flag: '🇹🇿',
      color: '#16a34a'
    },
    {
      name: 'Rwanda',
      code: 'RW',
      flag: '🇷🇼',
      color: '#7c3aed'
    },
    {
      name: 'Burundi',
      code: 'BI',
      flag: '🇧🇮',
      color: '#ea580c'
    },
    {
      name: 'South Sudan',
      code: 'SS',
      flag: '🇸🇸',
      color: '#0891b2'
    }
  ];
  
  // Chart Configuration
  export const CHART_CONFIG = {
    COLORS: {
      CASES: '#3b82f6',
      DEATHS: '#ef4444',
      RECOVERED: '#22c55e',
      ACTIVE: '#f59e0b'
    },
    DIMENSIONS: {
      MARGIN: { top: 20, right: 30, bottom: 40, left: 80 },
      MIN_HEIGHT: 300,
      MIN_WIDTH: 400
    }
  };
  
  // Data Types
  export const DATA_TYPES = {
    CASES: 'cases',
    DEATHS: 'deaths',
    RECOVERED: 'recovered',
    ACTIVE: 'active'
  };
  
  // Date Formats
  export const DATE_FORMATS = {
    DISPLAY: 'MMM dd, yyyy',
    API: 'yyyy-MM-dd',
    CHART: 'MM/dd'
  };
  
  // Loading States
  export const LOADING_STATES = {
    IDLE: 'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error'
  };
  
  // Error Messages
  export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    API_ERROR: 'Unable to fetch data. Using cached data instead.',
    NO_DATA: 'No data available for the selected criteria.',
    INVALID_COUNTRY: 'Invalid country selection.'
  };