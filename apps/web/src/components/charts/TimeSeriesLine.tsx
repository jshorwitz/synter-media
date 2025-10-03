"use client";
import React, { useEffect, useRef } from "react";
import D3Loader from "./D3Loader";
import { useResizeObserver } from "./useResizeObserver";

type Point = { date: Date; value: number };

export default function TimeSeriesLine({ data, height = 300 }: { data: Point[]; height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useResizeObserver(containerRef);

  useEffect(() => {
    if (!size || !containerRef.current || !globalThis.d3) return;
    const { width } = size;
    const margin = { top: 20, right: 30, bottom: 40, left: 60 };
    const w = Math.max(0, width - margin.left - margin.right);
    const h = Math.max(0, height - margin.top - margin.bottom);

    const root = containerRef.current;
    root.innerHTML = "";

    // Get CSS variables for theming
    const styles = getComputedStyle(root);
    const seriesColor = styles.getPropertyValue('--viz-series-1') || '217 91% 60%';
    const gridlineColor = styles.getPropertyValue('--viz-gridline') || '215 28% 24%';
    const axisColor = styles.getPropertyValue('--viz-axis') || '214 32% 91%';
    const tooltipBg = styles.getPropertyValue('--viz-tooltip-bg') || '217 33% 17%';
    const tooltipText = styles.getPropertyValue('--viz-tooltip-text') || '210 40% 96%';
    const tooltipBorder = styles.getPropertyValue('--viz-tooltip-border') || '217 91% 60%';

    const svg = d3
      .select(root)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("overflow", "visible")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleUtc()
      .domain(d3.extent(data, (d: any) => d.date))
      .range([0, w]);

    const y = d3
      .scaleLinear()
      .domain([0, (d3.max(data, (d: any) => d.value) as number) * 1.1 || 1])
      .nice()
      .range([h, 0]);

    // Gridlines
    svg.append("g")
      .attr("class", "grid")
      .attr("opacity", 0.1)
      .call(d3.axisLeft(y)
        .tickSize(-w)
        .tickFormat(() => "")
      )
      .style("stroke", `hsl(${gridlineColor})`);

    // X axis
    svg.append("g")
      .attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(6))
      .style("color", `hsl(${axisColor})`)
      .style("font-size", "12px");

    // Y axis
    svg.append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat((d) => `$${d.toLocaleString()}`))
      .style("color", `hsl(${axisColor})`)
      .style("font-size", "12px");

    // Area gradient
    const gradient = svg.append("defs")
      .append("linearGradient")
      .attr("id", "line-gradient")
      .attr("x1", "0%")
      .attr("x2", "0%")
      .attr("y1", "0%")
      .attr("y2", "100%");

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", `hsl(${seriesColor})`)
      .attr("stop-opacity", 0.4);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", `hsl(${seriesColor})`)
      .attr("stop-opacity", 0);

    // Line path
    const line = d3
      .line()
      .x((d: any) => x(d.date))
      .y((d: any) => y(d.value))
      .curve(d3.curveMonotoneX);

    // Area path
    const area = d3
      .area()
      .x((d: any) => x(d.date))
      .y0(h)
      .y1((d: any) => y(d.value))
      .curve(d3.curveMonotoneX);

    // Draw area
    svg
      .append("path")
      .datum(data)
      .attr("fill", "url(#line-gradient)")
      .attr("d", area as any);

    // Draw line with animation
    const path = svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", `hsl(${seriesColor})`)
      .attr("stroke-width", 3)
      .attr("d", line as any);

    const totalLength = (path.node() as any).getTotalLength();
    path
      .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1500)
      .ease(d3.easeQuadOut)
      .attr("stroke-dashoffset", 0);

    // Tooltip
    const tooltip = d3.select(root)
      .append("div")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", `hsl(${tooltipBg})`)
      .style("color", `hsl(${tooltipText})`)
      .style("padding", "8px 12px")
      .style("border-radius", "8px")
      .style("border", `1px solid hsl(${tooltipBorder})`)
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("z-index", "1000")
      .style("backdrop-filter", "blur(10px)")
      .style("box-shadow", "0 4px 12px rgba(0,0,0,0.3)");

    // Dots with hover
    const dots = svg
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d: any) => x(d.date))
      .attr("cy", (d: any) => y(d.value))
      .attr("r", 0)
      .attr("fill", `hsl(${seriesColor})`)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 6);
        
        tooltip
          .style("visibility", "visible")
          .html(`
            <div style="font-weight: 600; margin-bottom: 4px;">
              ${d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <div style="color: hsl(${seriesColor}); font-weight: 700; font-size: 16px;">
              $${d.value.toLocaleString()}
            </div>
          `);
      })
      .on("mousemove", function(event) {
        tooltip
          .style("top", (event.pageY - 60) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 4);
        
        tooltip.style("visibility", "hidden");
      });

    // Animate dots appearing
    dots
      .transition()
      .delay((d, i) => i * 50)
      .duration(600)
      .attr("r", 4);

  }, [data, size, height]);

  return (
    <div ref={containerRef} style={{ width: "100%", height, position: "relative" }}>
      <D3Loader />
    </div>
  );
}
