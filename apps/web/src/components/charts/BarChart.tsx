"use client";
import React, { useEffect, useRef } from "react";
import D3Loader from "./D3Loader";
import { useResizeObserver } from "./useResizeObserver";

type Datum = { label: string; value: number; color?: string };

export default function BarChart({ data, height = 300 }: { data: Datum[]; height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useResizeObserver(containerRef);

  useEffect(() => {
    if (!size || !containerRef.current || !globalThis.d3) return;
    const { width } = size;
    const margin = { top: 20, right: 20, bottom: 50, left: 60 };
    const w = Math.max(0, width - margin.left - margin.right);
    const h = Math.max(0, height - margin.top - margin.bottom);

    const root = containerRef.current;
    root.innerHTML = "";

    // Get CSS variables for theming
    const styles = getComputedStyle(root);
    const gridlineColor = styles.getPropertyValue('--viz-gridline') || '215 28% 24%';
    const axisColor = styles.getPropertyValue('--viz-axis') || '214 32% 91%';
    const tooltipBg = styles.getPropertyValue('--viz-tooltip-bg') || '217 33% 17%';
    const tooltipText = styles.getPropertyValue('--viz-tooltip-text') || '210 40% 96%';
    const tooltipBorder = styles.getPropertyValue('--viz-tooltip-border') || '217 91% 60%';

    // Color scale using CSS variables
    const colorScale = [
      styles.getPropertyValue('--viz-series-1') || '217 91% 60%',
      styles.getPropertyValue('--viz-series-2') || '142 76% 36%',
      styles.getPropertyValue('--viz-series-3') || '45 93% 47%',
      styles.getPropertyValue('--viz-series-4') || '0 84% 60%',
      styles.getPropertyValue('--viz-series-5') || '271 91% 65%',
      styles.getPropertyValue('--viz-series-6') || '189 94% 43%',
    ];

    const svg = d3
      .select(root)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("overflow", "visible")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, w])
      .padding(0.3);

    const y = d3
      .scaleLinear()
      .domain([0, (d3.max(data, (d: any) => d.value) || 0) * 1.1])
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
    svg
      .append("g")
      .attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("font-size", "12px")
      .style("color", `hsl(${axisColor})`)
      .attr("transform", "rotate(-12)")
      .style("text-anchor", "end");

    // Y axis
    svg.append("g")
      .call(d3.axisLeft(y).ticks(5).tickFormat((d) => `$${d.toLocaleString()}`))
      .style("color", `hsl(${axisColor})`)
      .style("font-size", "12px");

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

    // Bars
    const bars = svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.label)!)
      .attr("width", x.bandwidth())
      .attr("y", h)
      .attr("height", 0)
      .attr("rx", 6)
      .attr("fill", (d, i) => `hsl(${d.color || colorScale[i % colorScale.length]})`)
      .style("cursor", "pointer")
      .on("mouseover", function(event, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 0.8)
          .attr("y", y(d.value) - 3);
        
        tooltip
          .style("visibility", "visible")
          .html(`
            <div style="font-weight: 600; margin-bottom: 4px; text-transform: capitalize;">
              ${d.label}
            </div>
            <div style="font-weight: 700; font-size: 16px;">
              $${d.value.toLocaleString()}
            </div>
          `);
      })
      .on("mousemove", function(event) {
        tooltip
          .style("top", (event.pageY - 60) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", function(event, d: any) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("opacity", 1)
          .attr("y", y(d.value));
        
        tooltip.style("visibility", "hidden");
      });

    // Animate bars
    bars
      .transition()
      .delay((d, i) => i * 100)
      .duration(800)
      .ease(d3.easeCubicOut)
      .attr("y", (d) => y(d.value))
      .attr("height", (d) => h - y(d.value));

    // Value labels
    svg
      .selectAll("text.bar-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "bar-label")
      .attr("text-anchor", "middle")
      .attr("x", (d) => (x(d.label)! + x.bandwidth() / 2))
      .attr("y", h)
      .style("font-size", "11px")
      .style("font-weight", "600")
      .style("fill", `hsl(${axisColor})`)
      .style("opacity", 0)
      .text((d) => d.value >= 1000 ? `$${Math.round(d.value / 1000)}k` : `$${d.value}`)
      .transition()
      .delay((d, i) => i * 100 + 400)
      .duration(600)
      .attr("y", (d) => y(d.value) - 8)
      .style("opacity", 1);

  }, [data, size, height]);

  return (
    <div ref={containerRef} style={{ width: "100%", height, position: "relative" }}>
      <D3Loader />
    </div>
  );
}
