"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { BracketNode } from "@/types/archive";

interface D3BracketProps {
  data: BracketNode[];
  width?: number;
  height?: number;
}

export default function D3Bracket({ data, width = 800, height = 600 }: D3BracketProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width, height });

  useEffect(() => {
    // Responsive sizing
    const handleResize = () => {
      if (svgRef.current?.parentElement) {
        const containerWidth = svgRef.current.parentElement.clientWidth;
        setDimensions({
          width: Math.min(containerWidth, width),
          height: height,
        });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [width, height]);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3.select(svgRef.current);
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };
    const innerWidth = dimensions.width - margin.left - margin.right;
    const innerHeight = dimensions.height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Organize matches by round
    const rounds = d3.group(data, (d) => d.round);
    const maxRound = d3.max(data, (d) => d.round) || 1;
    
    // Layout calculations
    const roundWidth = innerWidth / (maxRound + 1);

    // Draw rounds
    rounds.forEach((matches, round) => {
      const x = round * roundWidth;
      const roundMatches = matches.sort((a, b) => a.match - b.match);

      // Round label
      g.append("text")
        .attr("x", x + roundWidth / 2)
        .attr("y", -15)
        .attr("text-anchor", "middle")
        .attr("class", "round-label")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .style("fill", "var(--bs-primary)")
        .text(`Round ${round}`);

      roundMatches.forEach((match, index) => {
        const y = (index + 1) * (innerHeight / (roundMatches.length + 1));

        // Match container
        const matchGroup = g
          .append("g")
          .attr("class", "match-group")
          .attr("transform", `translate(${x}, ${y})`)
          .style("cursor", "pointer")
          .on("mouseenter", function () {
            d3.select(this)
              .select("rect")
              .transition()
              .duration(200)
              .attr("stroke-width", 2)
              .attr("stroke", "var(--bs-primary)");
          })
          .on("mouseleave", function () {
            d3.select(this)
              .select("rect")
              .transition()
              .duration(200)
              .attr("stroke-width", 1)
              .attr("stroke", "var(--bs-border-color)");
          });

        // Match box
        const boxWidth = Math.max(roundWidth * 0.8, 120); // Minimum width of 120px
        const boxHeight = 60;

        matchGroup
          .append("rect")
          .attr("x", 0)
          .attr("y", -boxHeight / 2)
          .attr("width", boxWidth)
          .attr("height", boxHeight)
          .attr("rx", 6)
          .attr("fill", "var(--bs-body-bg)")
          .attr("stroke", "var(--bs-border-color)")
          .attr("stroke-width", 1)
          .style("transition", "all 0.3s ease");

        // Player 1
        if (match.player1) {
          const isWinner = match.winner === match.player1;
          matchGroup
            .append("text")
            .attr("x", 10)
            .attr("y", -10)
            .style("font-size", "12px")
            .style("font-weight", isWinner ? "bold" : "normal")
            .style("fill", isWinner ? "var(--bs-success)" : "var(--bs-body-color)")
            .text(match.player1);

          if (match.score1 !== undefined) {
            matchGroup
              .append("text")
              .attr("x", boxWidth - 10)
              .attr("y", -10)
              .attr("text-anchor", "end")
              .style("font-size", "12px")
              .style("font-weight", "bold")
              .style("fill", isWinner ? "var(--bs-success)" : "var(--bs-body-color)")
              .text(match.score1);
          }
        }

        // Player 2
        if (match.player2) {
          const isWinner = match.winner === match.player2;
          matchGroup
            .append("text")
            .attr("x", 10)
            .attr("y", 15)
            .style("font-size", "12px")
            .style("font-weight", isWinner ? "bold" : "normal")
            .style("fill", isWinner ? "var(--bs-success)" : "var(--bs-body-color)")
            .text(match.player2);

          if (match.score2 !== undefined) {
            matchGroup
              .append("text")
              .attr("x", boxWidth - 10)
              .attr("y", 15)
              .attr("text-anchor", "end")
              .style("font-size", "12px")
              .style("font-weight", "bold")
              .style("fill", isWinner ? "var(--bs-success)" : "var(--bs-body-color)")
              .text(match.score2);
          }
        }

        // Match number badge
        matchGroup
          .append("text")
          .attr("x", boxWidth / 2)
          .attr("y", -boxHeight / 2 - 5)
          .attr("text-anchor", "middle")
          .style("font-size", "10px")
          .style("fill", "var(--bs-secondary)")
          .text(`M${match.match}`);

        // Connection lines to next round (if applicable)
        if (match.nextMatchId && round < maxRound) {
          const nextMatch = data.find(
            (m) => m.id === match.nextMatchId && m.round === round + 1
          );
          if (nextMatch) {
            const nextIndex = roundMatches.indexOf(nextMatch);
            const nextY = (nextIndex + 1) * (innerHeight / (roundMatches.length + 1));

            g.append("path")
              .attr("d", `
                M ${x + boxWidth} ${y}
                L ${x + boxWidth + (roundWidth - boxWidth) / 2} ${y}
                L ${x + boxWidth + (roundWidth - boxWidth) / 2} ${nextY}
                L ${x + roundWidth} ${nextY}
              `)
              .attr("stroke", "var(--bs-border-color)")
              .attr("stroke-width", 1.5)
              .attr("fill", "none")
              .style("opacity", 0.6);
          }
        }
      });
    });

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom as any);

  }, [data, dimensions]);

  return (
    <div className="bracket-container" style={{ width: "100%", overflow: "hidden" }}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{
          border: "1px solid var(--bs-border-color)",
          borderRadius: "8px",
          backgroundColor: "var(--bs-body-bg)",
        }}
      />
      <div className="text-muted small mt-2 text-center">
        Scroll to zoom • Drag to pan
      </div>
    </div>
  );
}
