"use client";
import React, { useEffect, useRef } from "react";
import D3Loader from "./D3Loader";
import { useResizeObserver } from "./useResizeObserver";

type Slice = { label: string; value: number; color?: string };

export default function PieChart({ data, height = 240 }: { data: Slice[]; height?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const size = useResizeObserver(containerRef);

  useEffect(() => {
    if (!size || !globalThis.d3 || !containerRef.current) return;
    const width = Math.min(size.width, height);
    const radius = Math.min(width, height) / 2;

    const root = containerRef.current;
    root.innerHTML = "";

    const color = d3
      .scaleOrdinal()
      .domain(data.map((d) => d.label))
      .range(["#10b981", "#ef4444", "#f59e0b", "#3b82f6", "#8b5cf6"]);

    const pie = d3.pie<Slice>().value((d) => d.value);
    const arc = d3.arc().innerRadius(radius * 0.5).outerRadius(radius - 4);

    const svg = d3
      .select(root)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    const arcs = svg.selectAll("path").data(pie(data)).enter().append("path").attr("fill", (d: any) => color(d.data.label)).attr("d", arc as any);

    arcs.append("title").text((d: any) => `${d.data.label}: ${d.data.value}`);

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${-(width / 2) + 8},${-(height / 2) + 8})`);
    legend
      .selectAll("g")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", (_: any, i: number) => `translate(0,${i * 18})`)
      .call((g: any) =>
        g
          .append("rect")
          .attr("width", 12)
          .attr("height", 12)
          .attr("rx", 2)
          .attr("fill", (d: any) => color(d.label))
      )
      .call((g: any) =>
        g
          .append("text")
          .attr("x", 18)
          .attr("y", 10)
          .style("font-size", "12px")
          .text((d: any) => `${d.label} (${d.value})`)
      );
  }, [data, size, height]);

  return (
    <div ref={containerRef} style={{ width: "100%", height }}>
      <D3Loader />
    </div>
  );
}
