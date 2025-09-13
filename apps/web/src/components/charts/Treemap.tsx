"use client";
import React, { useEffect, useRef } from "react";
import D3Loader from "./D3Loader";
import { useResizeObserver } from "./useResizeObserver";

type Node = { name: string; value: number; group?: string };

export default function Treemap({ data, height = 320 }: { data: Node[]; height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useResizeObserver(containerRef);

  useEffect(() => {
    if (!size || !globalThis.d3 || !containerRef.current) return;
    const { width } = size;

    const rootEl = containerRef.current;
    rootEl.innerHTML = "";

    const color = d3
      .scaleOrdinal()
      .domain([...new Set(data.map((d) => d.group || "other"))])
      .range(["#ef4444", "#f59e0b", "#3b82f6", "#10b981", "#8b5cf6", "#06b6d4"]);

    const hierarchy = d3
      .hierarchy({ name: "root", children: data as any })
      .sum((d: any) => d.value)
      .sort((a: any, b: any) => b.value - a.value);

    const treemap = d3.treemap().size([width, height]).padding(2);
    treemap(hierarchy as any);

    const svg = d3
      .select(rootEl)
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    const nodes = svg.selectAll("g").data(hierarchy.leaves()).enter().append("g").attr("transform", (d: any) => `translate(${d.x0},${d.y0})`);

    nodes
      .append("rect")
      .attr("width", (d: any) => Math.max(0, d.x1 - d.x0))
      .attr("height", (d: any) => Math.max(0, d.y1 - d.y0))
      .attr("fill", (d: any) => color(d.data.group || "other"))
      .attr("rx", 6)
      .attr("ry", 6)
      .append("title")
      .text((d: any) => `${d.data.name}\n$${Math.round(d.data.value).toLocaleString()}`);

    nodes
      .append("text")
      .attr("x", 8)
      .attr("y", 18)
      .attr("fill", "white")
      .style("font-size", "12px")
      .style("font-weight", 600)
      .text((d: any) => d.data.name)
      .append("tspan")
      .attr("x", 8)
      .attr("dy", 16)
      .attr("fill", "#e5e7eb")
      .style("font-size", "11px")
      .text((d: any) => `$${Math.round(d.data.value).toLocaleString()}`);
  }, [data, size, height]);

  return (
    <div ref={containerRef} style={{ width: "100%", height }}>
      <D3Loader />
    </div>
  );
}
