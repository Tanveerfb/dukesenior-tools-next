import { describe, it, expect } from "vitest";
import {
  computeTopAveragePlayers,
  computeTopBestStreak,
  RawPlayerStats,
} from "../src/lib/services/phasmoTourney4.stats";

describe("PhasmoTourney4 stats helpers", () => {
  const sample: RawPlayerStats[] = [
    { name: "Alice", totalScore: 100, matchesPlayer: 5, bestStreak: 3 },
    { name: "Bob", totalScore: 40, matchesPlayer: 2, bestStreak: 4 },
    { name: "Carl", totalScore: 10, matchesPlayer: 1, bestStreak: 1 },
    { name: "Dana", totalScore: 0, matchesPlayer: 0, bestStreak: 0 },
    { name: "Eve", totalScore: 55, matchesPlayer: 5, bestStreak: 2 },
    { name: "Frank", totalScore: 90, matchesPlayer: 4, bestStreak: 5 },
  ];

  it("computes top average players with correct rounding and order", () => {
    const top = computeTopAveragePlayers(sample, 3);
    expect(top.map((p) => p.name)).toEqual(["Frank", "Alice", "Bob"]);
    expect(top[0].avgScore).toBeCloseTo(22.5);
    expect(top.find((p) => p.name === "Bob")?.avgScore).toBe(20); // 40/2
  });

  it("handles division by zero safely", () => {
    const top = computeTopAveragePlayers(sample, 6);
    const dana = top.find((p) => p.name === "Dana");
    expect(dana?.avgScore).toBe(0);
  });

  it("computes best streak sorted by best then name", () => {
    const top = computeTopBestStreak(sample, 2);
    expect(top.map((p) => p.name)).toEqual(["Frank", "Bob"]);
  });
});
