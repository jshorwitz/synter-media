"use client";
import React, { useEffect, useRef } from "react";
import D3Loader from "./D3Loader";
import { useResizeObserver } from "./useResizeObserver";

type Datum = { label: string; value: number; color?: string };

export default function BarChart({ data, height = 240 }: { data: Datum[]; height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useResizeObserver(containerRef);

  useEffect(() => {
    if (!size || !containerRef.current || !globalThis.d3) return;
    const { width } = size;
    const margin = { top: 10, right: 10, bottom: 40, left: 40 };
    const w = Math.max(0, width - margin.left - margin.right);
    const h = Math.max(0, height - margin.top - margin.bottom);

    const root = containerRef.current;
    root.innerHTML = "";
    const svg = d3
      .select(root)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, w])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d: any) => d.value) || 0])
      .nice()
      .range([h, 0]);

    const color = d3
      .scaleOrdinal()
      .domain(data.map((d) => d.label))
      .range(["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"]);

    svg
      .append("g")
      .attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .style("font-size", "12px");

    svg.append("g").call(d3.axisLeft(y).ticks(5));

    const bars = svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.label)!)
      .attr("width", x.bandwidth())
      .attr("y", h)
      .attr("height", 0)
      .attr("fill", (d) => d.color || (color(d.label) as string));

    bars
      .transition()
      .duration(600)
      .attr("y", (d) => y(d.value))
      .attr("height", (d) => h - y(d.value));

    // Values
    svg
      .selectAll("text.bar")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "bar")
      .attr("text-anchor", "middle")
      .attr("x", (d) => (x(d.label)! + x.bandwidth() / 2))
      .attr("y", (d) => y(d.value) - 6)
      .style("font-size", "11px")
      .text((d) => (d.value >= 1000 ? `$${Math.round(d.value).toLocaleString()}` : d.value.toFixed(0)));
  }, [data, size, height]);

  return (
    <div ref={containerRef} style={{ width: "100%", height }}>
      <D3Loader />
    </div>
  );
}
