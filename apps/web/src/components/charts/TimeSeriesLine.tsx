"use client";
import React, { useEffect, useRef } from "react";
import D3Loader from "./D3Loader";
import { useResizeObserver } from "./useResizeObserver";

type Point = { date: Date; value: number };

export default function TimeSeriesLine({ data, height = 240 }: { data: Point[]; height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useResizeObserver(containerRef);

  useEffect(() => {
    if (!size || !containerRef.current || !globalThis.d3) return;
    const { width } = size;
    const margin = { top: 10, right: 20, bottom: 30, left: 40 };
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
      .scaleUtc()
      .domain(d3.extent(data, (d: any) => d.date))
      .range([0, w]);

    const y = d3
      .scaleLinear()
      .domain([0, (d3.max(data, (d: any) => d.value) as number) || 1])
      .nice()
      .range([h, 0]);

    const line = d3
      .line()
      .x((d: any) => x(d.date))
      .y((d: any) => y(d.value))
      .curve(d3.curveMonotoneX);

    svg.append("g").attr("transform", `translate(0,${h})`).call(d3.axisBottom(x).ticks(6));
    svg.append("g").call(d3.axisLeft(y).ticks(5));

    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("d", line as any);

    // Dots
    svg
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d: any) => x(d.date))
      .attr("cy", (d: any) => y(d.value))
      .attr("r", 3)
      .attr("fill", "#1d4ed8");
  }, [data, size, height]);

  return (
    <div ref={containerRef} style={{ width: "100%", height }}>
      <D3Loader />
    </div>
  );
}
