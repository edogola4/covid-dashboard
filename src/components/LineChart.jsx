import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { formatNumber, formatDate, calculateDailyNewCases } from '../utils/dataProcessor.js';
import { CHART_CONFIG } from '../utils/constants.js';

/**
 * Interactive line chart component using D3.js and React
 * @param {Object} props - Component props
 * @param {Array} props.data - Time series data
 * @param {string} props.country - Country name
 * @param {boolean} props.showDaily - Show daily new cases instead of cumulative
 * @param {number} props.width - Chart width
 * @param {number} props.height - Chart height
 */
const LineChart = ({ 
  data = [], 
  country = '', 
  showDaily = false,
  width = 700, 
  height = 400 
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

    // Process data for daily vs cumulative
    const processedData = showDaily ? calculateDailyNewCases(data) : data;

    // Create main group
    const g = svg
      .attr('width', dimensions.width)
      .attr('height', dimensions.height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(processedData, d => d.date))
      .range([0, chartWidth]);

    const yScaleCases = d3
      .scaleLinear()
      .domain([0, d3.max(processedData, d => showDaily ? d.newCases : d.cases) || 0])
      .nice()
      .range([chartHeight, 0]);

    const yScaleDeaths = d3
      .scaleLinear()
      .domain([0, d3.max(processedData, d => showDaily ? d.newDeaths : d.deaths) || 0])
      .nice()
      .range([chartHeight, 0]);

    const yScaleRecovered = d3
      .scaleLinear()
      .domain([0, d3.max(processedData, d => showDaily ? d.newRecovered : d.recovered) || 0])
      .nice()
      .range([chartHeight, 0]);

    // Create line generators
    const lineCases = d3
      .line()
      .x(d => xScale(d.date))
      .y(d => yScaleCases(showDaily ? d.newCases : d.cases))
      .curve(d3.curveMonotoneX);

    const lineDeaths = d3
      .line()
      .x(d => xScale(d.date))
      .y(d => yScaleDeaths(showDaily ? d.newDeaths : d.deaths))
      .curve(d3.curveMonotoneX);

    const lineRecovered = d3
      .line()
      .x(d => xScale(d.date))
      .y(d => yScaleRecovered(showDaily ? d.newRecovered : d.recovered))
      .curve(d3.curveMonotoneX);

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-chartHeight)
        .tickFormat('')
        .ticks(6)
      )
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3);

    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(yScaleCases)
        .tickSize(-chartWidth)
        .tickFormat('')
        .ticks(6)
      )
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3);

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.timeFormat('%b %d'))
      .ticks(6);

    const yAxis = d3.axisLeft(yScaleCases)
      .tickFormat(d => formatNumber(d))
      .ticks(6);

    g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${chartHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#374151');

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#374151');

    // Add lines with animation
    const pathCases = g.append('path')
      .datum(processedData)
      .attr('class', 'line-cases')
      .attr('fill', 'none')
      .attr('stroke', CHART_CONFIG.COLORS.CASES)
      .attr('stroke-width', 3)
      .attr('d', lineCases);

    const pathDeaths = g.append('path')
      .datum(processedData)
      .attr('class', 'line-deaths')
      .attr('fill', 'none')
      .attr('stroke', CHART_CONFIG.COLORS.DEATHS)
      .attr('stroke-width', 2)
      .attr('d', lineDeaths);

    const pathRecovered = g.append('path')
      .datum(processedData)
      .attr('class', 'line-recovered')
      .attr('fill', 'none')
      .attr('stroke', CHART_CONFIG.COLORS.RECOVERED)
      .attr('stroke-width', 2)
      .attr('d', lineRecovered);

    // Animate lines
    const totalLength = pathCases.node().getTotalLength();
    
    [pathCases, pathDeaths, pathRecovered].forEach((path, index) => {
      const length = path.node().getTotalLength();
      path
        .attr('stroke-dasharray', length + ' ' + length)
        .attr('stroke-dashoffset', length)
        .transition()
        .duration(2000)
        .delay(index * 200)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0);
    });

    // Add interactive dots
    const focus = g.append('g')
      .attr('class', 'focus')
      .style('display', 'none');

    focus.append('circle')
      .attr('class', 'focus-circle-cases')
      .attr('r', 5)
      .attr('fill', CHART_CONFIG.COLORS.CASES);

    focus.append('circle')
      .attr('class', 'focus-circle-deaths')
      .attr('r', 4)
      .attr('fill', CHART_CONFIG.COLORS.DEATHS);

    focus.append('circle')
      .attr('class', 'focus-circle-recovered')
      .attr('r', 4)
      .attr('fill', CHART_CONFIG.COLORS.RECOVERED);

    // Overlay for mouse interactions
    g.append('rect')
      .attr('class', 'overlay')
      .attr('width', chartWidth)
      .attr('height', chartHeight)
      .style('fill', 'none')
      .style('pointer-events', 'all')
      .on('mouseover', () => focus.style('display', null))
      .on('mouseout', () => {
        focus.style('display', 'none');
        tooltip.style('opacity', 0);
      })
      .on('mousemove', function(event) {
        const [mouseX] = d3.pointer(event);
        const x0 = xScale.invert(mouseX);
        const bisectDate = d3.bisector(d => d.date).left;
        const i = bisectDate(processedData, x0, 1);
        const d0 = processedData[i - 1];
        const d1 = processedData[i];
        const d = x0 - d0?.date > d1?.date - x0 ? d1 : d0;

        if (d) {
          focus.select('.focus-circle-cases')
            .attr('cx', xScale(d.date))
            .attr('cy', yScaleCases(showDaily ? d.newCases : d.cases));

          focus.select('.focus-circle-deaths')
            .attr('cx', xScale(d.date))
            .attr('cy', yScaleDeaths(showDaily ? d.newDeaths : d.deaths));

          focus.select('.focus-circle-recovered')
            .attr('cx', xScale(d.date))
            .attr('cy', yScaleRecovered(showDaily ? d.newRecovered : d.recovered));

          // Show tooltip
          tooltip
            .style('opacity', 1)
            .html(`
              <div class="bg-gray-900 text-white p-3 rounded-lg shadow-lg max-w-xs">
                <div class="font-semibold mb-2">${formatDate(d.date)}</div>
                <div class="space-y-1 text-sm">
                  <div class="flex justify-between items-center">
                    <span class="flex items-center">
                      <div class="w-3 h-3 rounded-full mr-2" style="background-color: ${CHART_CONFIG.COLORS.CASES}"></div>
                      ${showDaily ? 'New' : 'Total'} Cases:
                    </span>
                    <span class="font-medium">${formatNumber(showDaily ? d.newCases : d.cases)}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="flex items-center">
                      <div class="w-3 h-3 rounded-full mr-2" style="background-color: ${CHART_CONFIG.COLORS.DEATHS}"></div>
                      ${showDaily ? 'New' : 'Total'} Deaths:
                    </span>
                    <span class="font-medium">${formatNumber(showDaily ? d.newDeaths : d.deaths)}</span>
                  </div>
                  <div class="flex justify-between items-center">
                    <span class="flex items-center">
                      <div class="w-3 h-3 rounded-full mr-2" style="background-color: ${CHART_CONFIG.COLORS.RECOVERED}"></div>
                      ${showDaily ? 'New' : 'Total'} Recovered:
                    </span>
                    <span class="font-medium">${formatNumber(showDaily ? d.newRecovered : d.recovered)}</span>
                  </div>
                </div>
              </div>
            `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        }
      });

    // Add legend
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${chartWidth - 150}, 20)`);

    const legendData = [
      { label: 'Cases', color: CHART_CONFIG.COLORS.CASES },
      { label: 'Deaths', color: CHART_CONFIG.COLORS.DEATHS },
      { label: 'Recovered', color: CHART_CONFIG.COLORS.RECOVERED }
    ];

    const legendItems = legend.selectAll('.legend-item')
      .data(legendData)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`);

    legendItems.append('line')
      .attr('x1', 0)
      .attr('x2', 15)
      .attr('stroke', d => d.color)
      .attr('stroke-width', 2);

    legendItems.append('text')
      .attr('x', 20)
      .attr('y', 0)
      .attr('dy', '0.35em')
      .style('font-size', '12px')
      .style('fill', '#374151')
      .text(d => d.label);

    // Add chart title
    g.append('text')
      .attr('class', 'chart-title')
      .attr('x', chartWidth / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .style('fill', '#1f2937')
      .text(`${showDaily ? 'Daily New' : 'Cumulative'} COVID-19 Cases - ${country}`);

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
      .text(`${showDaily ? 'Daily New' : 'Total'} Cases`);

  }, [data, country, showDaily, dimensions]);

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No data available</h3>
          <p className="mt-1 text-sm text-gray-500">Select a country to view trends</p>
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

export default LineChart;