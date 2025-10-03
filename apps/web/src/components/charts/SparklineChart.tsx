'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface DataPoint {
  value: number;
}

interface SparklineChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
  showArea?: boolean;
}

export default function SparklineChart({ 
  data, 
  width = 120, 
  height = 40,
  color = '#3b82f6',
  showArea = true
}: SparklineChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 2, right: 2, bottom: 2, left: 2 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleLinear()
      .domain([0, data.length - 1])
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain([d3.min(data, d => d.value) || 0, d3.max(data, d => d.value) || 0])
      .range([innerHeight, 0])
      .nice();

    // Line generator
    const line = d3.line<DataPoint>()
      .x((_, i) => x(i))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    // Area generator
    if (showArea) {
      const area = d3.area<DataPoint>()
        .x((_, i) => x(i))
        .y0(innerHeight)
        .y1(d => y(d.value))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(data)
        .attr('fill', color)
        .attr('fill-opacity', 0.2)
        .attr('d', area);
    }

    // Line path
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2)
      .attr('d', line);

    // Dots
    g.selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', (_, i) => x(i))
      .attr('cy', d => y(d.value))
      .attr('r', 0)
      .attr('fill', color)
      .transition()
      .duration(500)
      .delay((_, i) => i * 50)
      .attr('r', 2);

  }, [data, width, height, color, showArea]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      style={{ overflow: 'visible' }}
    />
  );
}
