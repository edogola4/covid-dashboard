import React, { useState, useMemo } from 'react';
import { useCovidData } from '../hooks/useCovidData.js';
import Header from './Header.jsx';
import CountryFilter from './CountryFilter.jsx';
import StatsCard from './StatsCard.jsx';
import BarChart from './BarChart.jsx';
import LineChart from './LineChart.jsx';
import LoadingSpinner from './LoadingSpinner.jsx';
import { DATA_TYPES } from '../utils/constants.js';
import { sortCountries } from '../utils/dataProcessor.js';

/**
 * Main dashboard component that orchestrates all COVID-19 data visualization
 */
const Dashboard = () => {
  // Custom hook for data management
  const {
    countries,
    historicalData,
    selectedCountry,
    loadingState,
    error,
    lastUpdated,
    setSelectedCountry,
    refreshData,
    clearError,
    isLoading,
    hasError,
    hasData
  } = useCovidData();

  // Local state for UI controls
  const [selectedMetric, setSelectedMetric] = useState(DATA_TYPES.CASES);
  const [showDaily, setShowDaily] = useState(false);
  const [sortBy, setSortBy] = useState(DATA_TYPES.CASES);

  // Computed values
  const sortedCountries = useMemo(() => {
    return sortCountries(countries, sortBy, 'desc');
  }, [countries, sortBy]);

  const selectedCountryData = useMemo(() => {
    return countries.find(country => country.country === selectedCountry);
  }, [countries, selectedCountry]);

  const totalStats = useMemo(() => {
    if (!countries.length) return null;
    
    return countries.reduce((acc, country) => ({
      cases: acc.cases + country.cases,
      deaths: acc.deaths + country.deaths,
      recovered: acc.recovered + country.recovered,
      active: acc.active + country.active,
      todayCases: acc.todayCases + country.todayCases,
      todayDeaths: acc.todayDeaths + country.todayDeaths,
      todayRecovered: acc.todayRecovered + country.todayRecovered,
      population: acc.population + country.population
    }), {
      cases: 0, deaths: 0, recovered: 0, active: 0,
      todayCases: 0, todayDeaths: 0, todayRecovered: 0, population: 0
    });
  }, [countries]);

  const historicalDataForSelected = useMemo(() => {
    return selectedCountry ? historicalData[selectedCountry] || [] : [];
  }, [selectedCountry, historicalData]);

  // Event handlers
  const handleCountrySelect = (countryName) => {
    setSelectedCountry(countryName);
    if (error) clearError();
  };

  const handleMetricChange = (metric) => {
    setSelectedMetric(metric);
    setSortBy(metric);
  };

  const handleRefresh = () => {
    refreshData();
    if (error) clearError();
  };

  // Icon components for stats cards
  const CasesIcon = () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );

  const DeathsIcon = () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
    </svg>
  );

  const RecoveredIcon = () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );

  const ActiveIcon = () => (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );

  if (isLoading && !hasData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          lastUpdated={lastUpdated}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSpinner size="lg" message="Loading COVID-19 data..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        lastUpdated={lastUpdated}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Banner */}
        {hasError && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    onClick={clearError}
                    className="inline-flex bg-yellow-50 rounded-md p-1.5 text-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-yellow-50 focus:ring-yellow-600"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Controls Section */}
        <div className="mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              {/* Country Filter */}
              <div className="flex-1 max-w-xs">
                <CountryFilter
                  countries={countries}
                  selectedCountry={selectedCountry}
                  onCountrySelect={handleCountrySelect}
                  isLoading={isLoading}
                />
              </div>

              {/* Metric Selector */}
              <div className="flex-1 max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Metric
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(DATA_TYPES).map((metric) => (
                    <button
                      key={metric}
                      onClick={() => handleMetricChange(metric)}
                      className={`
                        px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150
                        ${selectedMetric === metric
                          ? 'bg-primary-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      {metric.charAt(0).toUpperCase() + metric.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart Type Toggle */}
              {selectedCountry && (
                <div className="flex-1 max-w-xs">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chart Type
                  </label>
                  <div className="flex rounded-md shadow-sm">
                    <button
                      onClick={() => setShowDaily(false)}
                      className={`
                        flex-1 px-4 py-2 text-sm font-medium rounded-l-md transition-colors duration-150
                        ${!showDaily
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      Cumulative
                    </button>
                    <button
                      onClick={() => setShowDaily(true)}
                      className={`
                        flex-1 px-4 py-2 text-sm font-medium rounded-r-md transition-colors duration-150
                        ${showDaily
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      Daily
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedCountry ? `${selectedCountry} Statistics` : 'Regional Overview'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Cases"
              value={selectedCountryData ? selectedCountryData.cases : totalStats?.cases}
              change={selectedCountryData ? selectedCountryData.todayCases : totalStats?.todayCases}
              type="cases"
              icon={<CasesIcon />}
              isLoading={isLoading}
            />
            <StatsCard
              title="Deaths"
              value={selectedCountryData ? selectedCountryData.deaths : totalStats?.deaths}
              change={selectedCountryData ? selectedCountryData.todayDeaths : totalStats?.todayDeaths}
              type="deaths"
              icon={<DeathsIcon />}
              isLoading={isLoading}
            />
            <StatsCard
              title="Recovered"
              value={selectedCountryData ? selectedCountryData.recovered : totalStats?.recovered}
              change={selectedCountryData ? selectedCountryData.todayRecovered : totalStats?.todayRecovered}
              type="recovered"
              icon={<RecoveredIcon />}
              isLoading={isLoading}
            />
            <StatsCard
              title="Active Cases"
              value={selectedCountryData ? selectedCountryData.active : totalStats?.active}
              change={0} // Active cases don't have daily change in our data
              type="active"
              icon={<ActiveIcon />}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Bar Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Countries Comparison
              </h3>
              <div className="text-sm text-gray-500">
                Sorted by {selectedMetric}
              </div>
            </div>
            {isLoading ? (
              <LoadingSpinner size="md" message="Loading chart..." />
            ) : (
              <BarChart
                data={sortedCountries}
                metric={selectedMetric}
                title={`${selectedMetric.charAt(0).toUpperCase() + selectedMetric.slice(1)} by Country`}
              />
            )}
          </div>

          {/* Line Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Trends Over Time
              </h3>
              {selectedCountry && (
                <div className="text-sm text-gray-500">
                  {showDaily ? 'Daily new cases' : 'Cumulative data'}
                </div>
              )}
            </div>
            {isLoading && selectedCountry ? (
              <LoadingSpinner size="md" message="Loading trends..." />
            ) : (
              <LineChart
                data={historicalDataForSelected}
                country={selectedCountry || 'Select a country'}
                showDaily={showDaily}
              />
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Data Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Data Sources</h4>
              <ul className="space-y-1">
                <li>• Primary: disease.sh API</li>
                <li>• Fallback: Local cached data</li>
                <li>• Update frequency: Every 10 minutes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Coverage</h4>
              <ul className="space-y-1">
                <li>• East African countries only</li>
                <li>• Real-time and historical data</li>
                <li>• Population-adjusted metrics available</li>
              </ul>
            </div>
          </div>
          
          {lastUpdated && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                Last updated: {lastUpdated.toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;