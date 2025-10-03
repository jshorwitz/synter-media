"use client";
import React, { useEffect, useRef } from "react";
import D3Loader from "./D3Loader";
import { useResizeObserver } from "./useResizeObserver";

type Datum = { label: string; value: number; color?: string };

export default function DonutChart({ data, height = 300 }: { data: Datum[]; height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useResizeObserver(containerRef);

  useEffect(() => {
    if (!size || !containerRef.current || !globalThis.d3) return;
    const { width } = size;

    const root = containerRef.current;
    root.innerHTML = "";

    // Get CSS variables for theming
    const styles = getComputedStyle(root);
    const axisColor = styles.getPropertyValue('--viz-axis') || '214 32% 91%';
    const tooltipBg = styles.getPropertyValue('--viz-tooltip-bg') || '217 33% 17%';
    const tooltipText = styles.getPropertyValue('--viz-tooltip-text') || '210 40% 96%';
    const tooltipBorder = styles.getPropertyValue('--viz-tooltip-border') || '217 91% 60%';

    // Platform-specific colors
    const platformColors: Record<string, string> = {
      google: '217 91% 60%',    // blue
      reddit: '16 100% 50%',    // reddit orange
      microsoft: '142 76% 36%', // green  
      linkedin: '201 100% 35%', // linkedin blue
      facebook: '221 44% 41%',  // facebook blue
      twitter: '203 89% 53%',   // twitter blue
    };

    // Default color scale
    const colorScale = [
      styles.getPropertyValue('--viz-series-1') || '217 91% 60%',
      styles.getPropertyValue('--viz-series-2') || '142 76% 36%',
      styles.getPropertyValue('--viz-series-3') || '45 93% 47%',
      styles.getPropertyValue('--viz-series-4') || '0 84% 60%',
      styles.getPropertyValue('--viz-series-5') || '271 91% 65%',
      styles.getPropertyValue('--viz-series-6') || '189 94% 43%',
    ];

    const radius = Math.min(width, height) / 2 - 20;
    const innerRadius = radius * 0.6;

    const svg = d3
      .select(root)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const pie = d3.pie<Datum>()
      .value((d: any) => d.value)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius);

    const arcHover = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius + 8);

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

    const total = d3.sum(data, d => d.value);

    const slices = svg
      .selectAll("path")
      .data(pie(data))
      .enter()
      .append("path")
      .attr("d", arc as any)
      .attr("fill", (d: any, i) => {
        const platformColor = platformColors[d.data.label.toLowerCase()];
        return `hsl(${d.data.color || platformColor || colorScale[i % colorScale.length]})`;
      })
      .attr("stroke", "rgba(0,0,0,0.3)")
      .attr("stroke-width", 2)
      .style("cursor", "pointer")
      .style("opacity", 0)
      .on("mouseover", function(event, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("d", arcHover as any)
          .style("opacity", 1);
        
        const percentage = ((d.data.value / total) * 100).toFixed(1);
        tooltip
          .style("visibility", "visible")
          .html(`
            <div style="font-weight: 600; margin-bottom: 4px; text-transform: capitalize;">
              ${d.data.label}
            </div>
            <div style="font-weight: 700; font-size: 16px;">
              $${d.data.value.toLocaleString()}
            </div>
            <div style="font-size: 11px; margin-top: 4px; opacity: 0.8;">
              ${percentage}% of total
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
          .attr("d", arc as any)
          .style("opacity", 0.9);
        
        tooltip.style("visibility", "hidden");
      });

    // Animate slices
    slices
      .transition()
      .delay((d, i) => i * 100)
      .duration(600)
      .style("opacity", 0.9);

    // Center text - total
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "-0.2em")
      .style("font-size", "28px")
      .style("font-weight", "700")
      .style("fill", `hsl(${axisColor})`)
      .style("opacity", 0)
      .text(`$${total.toLocaleString()}`)
      .transition()
      .delay(400)
      .duration(600)
      .style("opacity", 1);

    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "1.5em")
      .style("font-size", "12px")
      .style("fill", `hsl(${axisColor})`)
      .style("opacity", 0.7)
      .text("Total Spend")
      .transition()
      .delay(400)
      .duration(600)
      .style("opacity", 0.7);

  }, [data, size, height]);

  return (
    <div ref={containerRef} style={{ width: "100%", height, position: "relative" }}>
      <D3Loader />
    </div>
  );
}
