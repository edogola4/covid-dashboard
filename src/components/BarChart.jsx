import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { formatNumber } from '../utils/dataProcessor.js';
import { CHART_CONFIG, DATA_TYPES } from '../utils/constants.js';

/**
 * Interactive bar chart component using D3.js and React
 * @param {Object} props - Component props
 * @param {Array} props.data - Chart data
 * @param {string} props.metric - Metric to display (cases, deaths, recovered, active)
 * @param {number} props.width - Chart width
 * @param {number} props.height - Chart height
 * @param {string} props.title - Chart title
 */
const BarChart = ({ 
  data = [], 
  metric = DATA_TYPES.CASES, 
  width = 600, 
  height = 400,
  title = 'COVID-19 Statistics by Country'
}) => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [dimensions, setDimensions] = useState({ width, height });

  // Handle responsive sizing
  useEffect(() => {
    const handleResize = () => {
      const container = svgRef.current?.parentElement;
      if (container) {
        const containerWidth = container.offsetWidth;
        const newWidth = Math.max(CHART_CONFIG.DIMENSIONS.MIN_WIDTH, containerWidth - 32);
        const newHeight = Math.max(CHART_CONFIG.DIMENSIONS.MIN_HEIGHT, height);
        setDimensions({ width: newWidth, height: newHeight });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [height]);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);
    
    // Clear previous chart
    svg.selectAll('*').remove();

    const margin = CHART_CONFIG.DIMENSIONS.MARGIN;
    const chartWidth = dimensions.width - margin.left - margin.right;
    const chartHeight = dimensions.height - margin.top - margin.bottom;

    // Create main group
    const g = svg
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Sort data by metric value
    const sortedData = [...data].sort((a, b) => b[metric] - a[metric]);

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(sortedData.map(d => d.country))
      .range([0, chartWidth])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(sortedData, d => d[metric]) || 0])
      .nice()
      .range([chartHeight, 0]);

    // Color scale
    const colorScale = d3
      .scaleOrdinal()
      .domain(sortedData.map(d => d.country))
      .range(sortedData.map(d => d.color || CHART_CONFIG.COLORS[metric.toUpperCase()]));

    // Create axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale)
      .tickFormat(d => formatNumber(d))
      .ticks(6);

    // Add X axis
    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#374151');

    // Add Y axis
    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#374151');

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-chartHeight)
        .tickFormat('')
      )
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3);

    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScale)
        .tickSize(-chartWidth)
        .tickFormat('')
      )
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3);

    // Create bars with animation
    const bars = g.selectAll('.bar')
      .data(sortedData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.country))
      .attr('width', xScale.bandwidth())
      .attr('y', chartHeight)
      .attr('height', 0)
      .attr('fill', d => colorScale(d.country))
      .style('cursor', 'pointer')
      .style('opacity', 0.8);

    // Animate bars
    bars.transition()
      .duration(1000)
      .ease(d3.easeBackOut)
      .attr('y', d => yScale(d[metric]))
      .attr('height', d => chartHeight - yScale(d[metric]));

    // Add hover effects
    bars
      .on('mouseover', function(event, d) {
        // Highlight bar
        d3.select(this)
          .transition()
          .duration(200)
          .style('opacity', 1)
          .attr('stroke', '#1f2937')
          .attr('stroke-width', 2);

        // Show tooltip
        tooltip
          .style('opacity', 1)
          .html(`
            <div class="bg-gray-900 text-white p-3 rounded-lg shadow-lg max-w-xs">
              <div class="flex items-center mb-2">
                <span class="text-lg mr-2">${d.flag}</span>
                <span class="font-semibold">${d.country}</span>
              </div>
              <div class="space-y-1 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-300">Total ${metric}:</span>
                  <span class="font-medium">${formatNumber(d[metric])}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-300">Population:</span>
                  <span class="font-medium">${formatNumber(d.population)}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-300">Per 100k:</span>
                  <span class="font-medium">${formatNumber((d[metric] / d.population) * 100000)}</span>
                </div>
              </div>
            </div>
          `)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mousemove', function(event) {
        tooltip
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 10) + 'px');
      })
      .on('mouseout', function() {
        // Reset bar
        d3.select(this)
          .transition()
          .duration(200)
          .style('opacity', 0.8)
          .attr('stroke', 'none');

        // Hide tooltip
        tooltip.style('opacity', 0);
      });

    // Add value labels on bars
    g.selectAll('.bar-label')
      .data(sortedData)
      .enter()
      .append('text')
      .attr('class', 'bar-label')
      .attr('x', d => xScale(d.country) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d[metric]) - 5)
      .attr('text-anchor', 'middle')
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .style('fill', '#374151')
      .style('opacity', 0)
      .text(d => formatNumber(d[metric]))
      .transition()
      .delay(1000)
      .duration(500)
      .style('opacity', 1);

    // Add chart title
    g.append('text')
      .attr('class', 'chart-title')
      .attr('x', chartWidth / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', '#1f2937')
      .text(title);

    // Add Y-axis label
    g.append('text')
      .attr('class', 'y-axis-label')
      .attr('transform', 'rotate(-90)')
      .attr('y', -margin.left + 20)
      .attr('x', -chartHeight / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', '500')
      .style('fill', '#6b7280')
      .text(`Total ${metric.charAt(0).toUpperCase() + metric.slice(1)}`);

  }, [data, metric, dimensions]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
          <p className="mt-1 text-sm text-gray-500">No chart data to display</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <svg ref={svgRef} className="w-full h-auto"></svg>
      <div 
        ref={tooltipRef} 
        className="absolute pointer-events-none opacity-0 transition-opacity duration-200 z-10"
        style={{ position: 'absolute' }}
      />
    </div>
  );
};

export default BarChart;