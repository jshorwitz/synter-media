'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface HeroVisualizationProps {
  className?: string;
}

export function HeroVisualization({ className = '' }: HeroVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeVisualization = async () => {
      if (!containerRef.current || controllerRef.current) return;

      try {
        // Initialize D3 visualization
        const viz = await initInlineVisualization(containerRef.current);
        controllerRef.current = viz;
        
        if (isMounted) {
          setIsLoaded(true);
        }
      } catch (err) {
        console.warn('Failed to initialize Synter visualization:', err);
        if (isMounted) {
          setError('Visualization temporarily unavailable');
        }
      }
    };

    // Small delay to ensure DOM is ready
    const timeout = setTimeout(initializeVisualization, 250);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      if (controllerRef.current) {
        try {
          controllerRef.current.destroy?.();
        } catch (err) {
          console.warn('Error destroying visualization:', err);
        }
        controllerRef.current = null;
      }
    };
  }, []);

  // Inline D3 visualization function
  const initInlineVisualization = async (container: HTMLElement) => {
    
    const DEFAULT_CHANNELS = [
      { id: "google", label: "Google", color: "#4285F4" },
      { id: "meta", label: "Meta", color: "#1877F2" },
      { id: "linkedin", label: "LinkedIn", color: "#0A66C2" },
      { id: "xads", label: "X", color: "#000000" },
      { id: "microsoft", label: "Microsoft", color: "#00A4EF" },
      { id: "youtube", label: "YouTube", color: "#FF0000" },
      { id: "reddit", label: "Reddit", color: "#FF4500" }
    ];

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    // Ensure container has dimensions
    let width = container.clientWidth || window.innerWidth || 1200;
    let height = container.clientHeight || window.innerHeight || 600;
    
    // Set minimum dimensions
    if (width < 400) width = 400;
    if (height < 300) height = 300;
    
    const svg = d3.select(container).append("svg")
      .attr("width", "100%")
      .attr("height", "100%")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid slice")
      .attr("aria-hidden", "true");

    // Layers
    const gBg = svg.append("g").attr("data-layer", "background");
    const gLinks = svg.append("g").attr("data-layer", "links");
    const gParticles = svg.append("g").attr("data-layer", "particles").attr("data-animated", "true");
    const gNodes = svg.append("g").attr("data-layer", "nodes");
    const gLabels = svg.append("g").attr("data-layer", "labels");

    // Defs for gradients
    const defs = svg.append("defs");
    const glow = defs.append("filter").attr("id", "glow").attr("width", "150%").attr("height", "150%");
    glow.append("feGaussianBlur").attr("stdDeviation", 3).attr("result", "blur");
    glow.append("feMerge")
        .selectAll("feMergeNode")
        .data(["blur","SourceGraphic"])
        .enter().append("feMergeNode")
        .attr("in", d => d);

    const gradSpend = defs.append("linearGradient").attr("id", "gradSpend").attr("x1","0%").attr("x2","100%");
    gradSpend.append("stop").attr("offset","0%").attr("stop-color","hsl(78 95% 60%)").attr("stop-opacity", 0.8);
    gradSpend.append("stop").attr("offset","100%").attr("stop-color","hsl(210 90% 60%)").attr("stop-opacity", 0.6);

    const gradReturn = defs.append("linearGradient").attr("id", "gradReturn").attr("x1","0%").attr("x2","100%");
    gradReturn.append("stop").attr("offset","0%").attr("stop-color","hsl(150 60% 45%)").attr("stop-opacity", 0.7);
    gradReturn.append("stop").attr("offset","100%").attr("stop-color","hsl(210 10% 70%)").attr("stop-opacity", 0.4);

    // Geometry
    const center = { x: width/2, y: height/2 };
    let radius = Math.min(width, height) * 0.33;

    // Background circles
    gBg.append("circle")
      .attr("cx", center.x).attr("cy", center.y).attr("r", Math.min(width, height) * 0.38)
      .attr("fill", "none")
      .attr("stroke", "hsl(210 10% 70%)")
      .attr("stroke-opacity", 0.05);

    gBg.append("circle")
      .attr("cx", center.x).attr("cy", center.y).attr("r", radius)
      .attr("fill", "none")
      .attr("stroke", "hsl(210 15% 92%)")
      .attr("stroke-opacity", 0.08);

    // Central Agent
    const agent = gNodes.append("g").attr("data-node", "agent");
    agent.append("circle")
      .attr("cx", center.x).attr("cy", center.y).attr("r", 22)
      .attr("fill", "hsl(210 15% 92%)").attr("fill-opacity", 0.06)
      .attr("stroke", "hsl(78 95% 60%)").attr("stroke-opacity", 0.4)
      .attr("filter", "url(#glow)");
    agent.append("circle")
      .attr("cx", center.x).attr("cy", center.y).attr("r", 6.5)
      .attr("fill", "hsl(78 95% 60%)");

    // Channel nodes
    const angleStep = (Math.PI * 2) / DEFAULT_CHANNELS.length;
    const channelNodes = DEFAULT_CHANNELS.map((ch, i) => {
      const angle = -Math.PI/2 + i * angleStep;
      return {
        ...ch,
        angle,
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle)
      };
    });

    // Create paths function
    function curvePath(a: any, b: any, bend = 0.22) {
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const dx = b.x - a.x, dy = b.y - a.y;
      const nx = -dy, ny = dx;
      const len = Math.hypot(nx, ny) || 1;
      const c = { x: mx + (nx/len) * bend * radius, y: my + (ny/len) * bend * radius };
      return `M${a.x},${a.y} Q${c.x},${c.y} ${b.x},${b.y}`;
    }

    // Links
    const links = channelNodes.map((node) => {
      const spendPath = gLinks.append("path")
        .attr("d", curvePath(center, node, 0.20))
        .attr("fill", "none")
        .attr("stroke", "url(#gradSpend)")
        .attr("stroke-width", 1.2)
        .attr("stroke-opacity", 0.35);

      const returnPath = gLinks.append("path")
        .attr("d", curvePath(node, center, 0.20))
        .attr("fill", "none")
        .attr("stroke", "url(#gradReturn)")
        .attr("stroke-width", 1.0)
        .attr("stroke-opacity", 0.20);

      return {
        node, spendPath, returnPath,
        spendLen: spendPath.node()?.getTotalLength() || 0,
        returnLen: returnPath.node()?.getTotalLength() || 0,
        spendRate: 0.4 + Math.random()*0.4,
        returnRate: 0.25 + Math.random()*0.35
      };
    });

    // Nodes
    const nodeG = gNodes.selectAll("g.channel")
      .data(channelNodes)
      .enter().append("g")
      .attr("class", "channel")
      .attr("transform", (d: any) => `translate(${d.x},${d.y})`)
      .style("cursor", "pointer");

    nodeG.append("circle")
      .attr("r", 8)
      .attr("fill", "hsl(210 15% 92%)")
      .attr("fill-opacity", 0.1)
      .attr("stroke", "hsl(210 15% 92%)")
      .attr("stroke-opacity", 0.5)
      .attr("stroke-width", 1.5);

    nodeG.append("circle")
      .attr("r", 3.2)
      .attr("fill", (d: any) => d.color || "hsl(210 90% 60%)");

    // Labels
    gLabels.selectAll("text.label")
      .data(channelNodes)
      .enter().append("text")
      .attr("class", "label")
      .attr("x", (d: any) => d.x + Math.cos(d.angle) * 18)
      .attr("y", (d: any) => d.y + Math.sin(d.angle) * 18)
      .attr("dy", "0.35em")
      .attr("fill", "hsl(210 15% 92%)")
      .attr("opacity", 0.6)
      .attr("font-size", 11)
      .attr("font-weight", 500)
      .attr("text-anchor", (d: any) => Math.cos(d.angle) > 0 ? "start" : "end")
      .text((d: any) => d.label);

    // Add interactivity to nodes
    nodeG
      .on("mouseenter", function(event, d) {
        d3.select(this)
          .select("circle:first-of-type")
          .transition()
          .duration(200)
          .attr("stroke-opacity", 1)
          .attr("filter", "url(#glow)");
      })
      .on("mouseleave", function(event, d) {
        d3.select(this)
          .select("circle:first-of-type")
          .transition()
          .duration(200)
          .attr("stroke-opacity", 0.5)
          .attr("filter", null);
      });

    // Simple particle animation (if motion not reduced)
    if (!prefersReducedMotion) {
      const particles: any[] = [];
      const returnParticles: any[] = [];
      
      links.forEach(L => {
        // Spend particles (agent to channel)
        for (let i = 0; i < 6; i++) {
          const c = gParticles.append("circle")
            .attr("r", 1.2 + Math.random() * 0.6)
            .attr("fill", "hsl(78 95% 60%)")
            .attr("opacity", 0);
          particles.push({ 
            el: c, 
            link: L, 
            t: Math.random() * -2, 
            speed: 0.004 + Math.random() * 0.002 
          });
        }
        
        // Return particles (channel to agent)
        for (let i = 0; i < 4; i++) {
          const c = gParticles.append("circle")
            .attr("r", 1.0 + Math.random() * 0.4)
            .attr("fill", "hsl(150 60% 45%)")
            .attr("opacity", 0);
          returnParticles.push({ 
            el: c, 
            link: L, 
            t: Math.random() * -2, 
            speed: 0.003 + Math.random() * 0.0015 
          });
        }
      });

      let animationId: number;
      function animate() {
        // Spend particles
        particles.forEach(p => {
          p.t += p.speed;
          if (p.t > 1.2) { 
            p.t = Math.random() * -1; 
            p.el.attr("opacity", 0); 
            return; 
          }
          if (p.t < 0) {
            p.el.attr("opacity", 0);
            return;
          }
          const progress = Math.min(Math.max(p.t, 0), 1);
          const dist = progress * p.link.spendLen;
          const pt = p.link.spendPath.node()?.getPointAtLength(dist);
          if (pt) {
            const opacity = Math.sin(progress * Math.PI) * 0.7;
            p.el.attr("opacity", opacity).attr("transform", `translate(${pt.x},${pt.y})`);
          }
        });
        
        // Return particles
        returnParticles.forEach(p => {
          p.t += p.speed;
          if (p.t > 1.2) { 
            p.t = Math.random() * -1; 
            p.el.attr("opacity", 0); 
            return; 
          }
          if (p.t < 0) {
            p.el.attr("opacity", 0);
            return;
          }
          const progress = Math.min(Math.max(p.t, 0), 1);
          const dist = progress * p.link.returnLen;
          const pt = p.link.returnPath.node()?.getPointAtLength(dist);
          if (pt) {
            const opacity = Math.sin(progress * Math.PI) * 0.5;
            p.el.attr("opacity", opacity).attr("transform", `translate(${pt.x},${pt.y})`);
          }
        });
        
        animationId = requestAnimationFrame(animate);
      }
      animate();
      
      // Return cleanup function for animation
      return {
        pause: () => {},
        resume: () => {},
        destroy: () => {
          if (animationId) cancelAnimationFrame(animationId);
          svg.remove();
        },
        setTheme: () => {},
        updateMetrics: () => {}
      };
    }

    return {
      pause: () => {},
      resume: () => {},
      destroy: () => svg.remove(),
      setTheme: () => {},
      updateMetrics: () => {}
    };
  };

  return (
    <div className={`hero-visualization ${className}`}>
      <div
        ref={containerRef}
        className={`absolute inset-0 transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
        role="img"
        aria-label="Interactive visualization of AI media orchestration"
      />
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-synter-ink-2 text-sm">
            Visualization temporarily unavailable
          </div>
        </div>
      )}
      
      {!isLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="synter-spinner" />
        </div>
      )}
      
      {/* Tooltip container */}
      <div id="viz-tooltip" className="tooltip" role="status" aria-live="polite" />
    </div>
  );
}
