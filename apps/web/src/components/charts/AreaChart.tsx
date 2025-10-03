'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface DataPoint {
  date: Date;
  value: number;
  label?: string;
}

interface AreaChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  gradient?: boolean;
}

export default function AreaChart({ 
  data, 
  height = 300,
  color = '#3b82f6',
  gradient = true
}: AreaChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height });

  useEffect(() => {
    if (!containerRef.current) return;
    
    const resizeObserver = new ResizeObserver(entries => {
      if (entries[0]) {
        setDimensions({
          width: entries[0].contentRect.width,
          height
        });
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, [height]);

  useEffect(() => {
    if (!svgRef.current || !data.length || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const width = dimensions.width - margin.left - margin.right;
    const innerHeight = dimensions.height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Gradient definition
    if (gradient) {
      const defs = svg.append('defs');
      const gradientId = 'areaGradient';
      
      const linearGradient = defs
        .append('linearGradient')
        .attr('id', gradientId)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      linearGradient
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', color)
        .attr('stop-opacity', 0.6);

      linearGradient
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', color)
        .attr('stop-opacity', 0.05);
    }

    // Scales
    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 0])
      .range([innerHeight, 0])
      .nice();

    // Area generator
    const area = d3.area<DataPoint>()
      .x(d => x(d.date))
      .y0(innerHeight)
      .y1(d => y(d.value))
      .curve(d3.curveMonotoneX);

    // Line generator
    const line = d3.line<DataPoint>()
      .x(d => x(d.date))
      .y(d => y(d.value))
      .curve(d3.curveMonotoneX);

    // Area path with animation
    const areaPath = g.append('path')
      .datum(data)
      .attr('fill', gradient ? 'url(#areaGradient)' : color)
      .attr('fill-opacity', gradient ? 1 : 0.3)
      .attr('d', area);

    const areaLength = areaPath.node()?.getTotalLength() || 0;
    
    areaPath
      .attr('stroke-dasharray', `${areaLength} ${areaLength}`)
      .attr('stroke-dashoffset', areaLength)
      .transition()
      .duration(1500)
      .ease(d3.easeQuadInOut)
      .attr('stroke-dashoffset', 0);

    // Line path
    const linePath = g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 3)
      .attr('d', line);

    const lineLength = linePath.node()?.getTotalLength() || 0;
    
    linePath
      .attr('stroke-dasharray', `${lineLength} ${lineLength}`)
      .attr('stroke-dashoffset', lineLength)
      .transition()
      .duration(1500)
      .ease(d3.easeQuadInOut)
      .attr('stroke-dashoffset', 0);

    // Axes
    const xAxis = d3.axisBottom(x)
      .ticks(6)
      .tickFormat(d3.timeFormat('%b %d') as any);

    const yAxis = d3.axisLeft(y)
      .ticks(5)
      .tickFormat(d => `$${d3.format('.2s')(d as number)}`);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .attr('color', '#94a3b8')
      .selectAll('text')
      .attr('font-size', '12px');

    g.append('g')
      .call(yAxis)
      .attr('color', '#94a3b8')
      .selectAll('text')
      .attr('font-size', '12px');

    // Remove domain lines
    g.selectAll('.domain').remove();

    // Style tick lines
    g.selectAll('.tick line')
      .attr('stroke', '#334155')
      .attr('stroke-dasharray', '2,2');

    // Tooltip
    const tooltip = d3.select(containerRef.current)
      .append('div')
      .attr('class', 'chart-tooltip')
      .style('position', 'absolute')
      .style('visibility', 'hidden')
      .style('background', 'rgba(15, 23, 42, 0.95)')
      .style('color', '#fff')
      .style('padding', '8px 12px')
      .style('border-radius', '6px')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .style('z-index', '1000')
      .style('border', '1px solid rgba(148, 163, 184, 0.2)');

    // Invisible overlay for mouse tracking
    const overlay = g.append('rect')
      .attr('width', width)
      .attr('height', innerHeight)
      .attr('fill', 'none')
      .attr('pointer-events', 'all');

    const focus = g.append('g')
      .style('display', 'none');

    focus.append('circle')
      .attr('r', 5)
      .attr('fill', color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    focus.append('line')
      .attr('class', 'focus-line-y')
      .attr('stroke', color)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0.5);

    overlay
      .on('mouseover', () => {
        focus.style('display', null);
        tooltip.style('visibility', 'visible');
      })
      .on('mouseout', () => {
        focus.style('display', 'none');
        tooltip.style('visibility', 'hidden');
      })
      .on('mousemove', function(event) {
        const [mouseX] = d3.pointer(event);
        const x0 = x.invert(mouseX);
        const bisect = d3.bisector((d: DataPoint) => d.date).left;
        const i = bisect(data, x0, 1);
        const d0 = data[i - 1];
        const d1 = data[i];
        const d = x0.getTime() - d0.date.getTime() > d1.date.getTime() - x0.getTime() ? d1 : d0;

        focus.attr('transform', `translate(${x(d.date)},${y(d.value)})`);
        
        focus.select('.focus-line-y')
          .attr('y1', 0)
          .attr('y2', innerHeight - y(d.value));

        tooltip
          .html(`
            <div style="font-weight: 600; margin-bottom: 4px;">
              ${d3.timeFormat('%b %d, %Y')(d.date)}
            </div>
            <div style="color: ${color};">
              $${d3.format(',.2f')(d.value)}
            </div>
          `)
          .style('left', `${event.pageX - containerRef.current!.getBoundingClientRect().left + 15}px`)
          .style('top', `${event.pageY - containerRef.current!.getBoundingClientRect().top - 28}px`);
      });

  }, [data, dimensions, color, gradient]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: `${height}px` }}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ display: 'block' }}
      />
    </div>
  );
}
