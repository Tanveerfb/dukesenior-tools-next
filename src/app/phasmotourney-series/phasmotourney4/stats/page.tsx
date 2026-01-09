"use client";
import { useEffect, useState } from "react";
import { Alert, Badge, Col, Row, Spinner, Table } from "react-bootstrap";
import TourneyPage from "@/components/tourney/TourneyPage";
import { buildTourneyBreadcrumbs } from "@/lib/navigation/tourneyBreadcrumbs";
import {
  getMostRuns,
  getAvgRuns,
  getCurrentStreakStandings,
  getBestStreakStandings,
} from "@/lib/services/phasmoTourney4";

interface StatBlock {
  title: string;
  rows: any[];
  cols: {
    key: string;
    label: string;
    render?: (row: any, i: number) => React.ReactNode;
  }[];
  description?: string;
}

export default function Tourney4GroupedStatsPage() {
  const [mostRuns, setMostRuns] = useState<any[]>([]);
  const [avgRuns, setAvgRuns] = useState<any[]>([]);
  const [currentStreak, setCurrentStreak] = useState<any[]>([]);
  const [bestStreak, setBestStreak] = useState<any[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | undefined>();
  useEffect(() => {
    (async () => {
      try {
        const [m, a, c, b] = await Promise.all([
          getMostRuns(),
          getAvgRuns(),
          getCurrentStreakStandings(),
          getBestStreakStandings(),
        ]);
        setMostRuns(m);
        setAvgRuns(a);
        setCurrentStreak(c);
        setBestStreak(b);
        setReady(true);
      } catch (e: any) {
        setError(e?.message || "Failed to load stats");
      }
    })();
  }, []);

  const blocks: StatBlock[] = [
    {
      title: "Most Runs (Total Score)",
      rows: mostRuns,
      cols: [
        {
          key: "rank",
          label: "#",
          render: (_r, i) => (
            <Badge
              bg={
                i === 0
                  ? "warning"
                  : i === 1
                  ? "secondary"
                  : i === 2
                  ? "info"
                  : "dark"
              }
              text={i === 0 ? "dark" : undefined}
            >
              {i + 1}
            </Badge>
          ),
        },
        { key: "name", label: "Player" },
        { key: "totalScore", label: "Total Score" },
      ],
    },
    {
      title: "Average Score",
      rows: avgRuns,
      cols: [
        {
          key: "rank",
          label: "#",
          render: (_r, i) => (
            <Badge
              bg={
                i === 0
                  ? "warning"
                  : i === 1
                  ? "secondary"
                  : i === 2
                  ? "info"
                  : "dark"
              }
              text={i === 0 ? "dark" : undefined}
            >
              {i + 1}
            </Badge>
          ),
        },
        { key: "name", label: "Player" },
        { key: "avgScore", label: "Avg Score" },
      ],
    },
    {
      title: "Current Streak",
      rows: currentStreak,
      cols: [
        {
          key: "rank",
          label: "#",
          render: (_r, i) => (
            <Badge
              bg={
                i === 0
                  ? "warning"
                  : i === 1
                  ? "secondary"
                  : i === 2
                  ? "info"
                  : "dark"
              }
              text={i === 0 ? "dark" : undefined}
            >
              {i + 1}
            </Badge>
          ),
        },
        { key: "name", label: "Player" },
        { key: "streak", label: "Streak" },
      ],
    },
    {
      title: "Best Streak",
      rows: bestStreak,
      cols: [
        {
          key: "rank",
          label: "#",
          render: (_r, i) => (
            <Badge
              bg={
                i === 0
                  ? "warning"
                  : i === 1
                  ? "secondary"
                  : i === 2
                  ? "info"
                  : "dark"
              }
              text={i === 0 ? "dark" : undefined}
            >
              {i + 1}
            </Badge>
          ),
        },
        { key: "name", label: "Player" },
        { key: "bestStreak", label: "Best" },
      ],
    },
  ];

  function renderBlock(block: StatBlock) {
    return (
      <Col xs={12} md={6} className="mb-4" key={block.title}>
        <div className="stat-card h-100 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="mb-0">{block.title}</h5>
          </div>
          <div className="flex-grow-1">
            <Table size="sm" hover responsive className="mb-0 stat-table">
              <thead>
                <tr>
                  {block.cols.map((c) => (
                    <th key={c.key}>{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((r, i) => (
                  <tr key={r.name || i}>
                    {block.cols.map((c) => (
                      <td key={c.key}>
                        {c.render ? c.render(r, i) : r[c.key]}
                      </td>
                    ))}
                  </tr>
                ))}
                {block.rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={block.cols.length}
                      className="text-muted small fst-italic text-center"
                    >
                      No data
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </div>
      </Col>
    );
  }

  const breadcrumbs = buildTourneyBreadcrumbs([
    { label: "Phasmo Tourney 4", href: "/phasmotourney-series/phasmotourney4" },
    { label: "Player Leaderboards" },
  ]);

  return (
    <TourneyPage
      title="Player Leaderboards"
      subtitle="Auto-generated from the live run submissions. Updated whenever the data service syncs."
      breadcrumbs={breadcrumbs}
      badges={[{ label: "Phasmo Tourney 4" }, { label: "Stats" }]}
      containerProps={{ className: "py-4" }}
    >
      <p className="text-muted small">
        Separate tables for each leaderboard metric. Ranking badges highlight
        the top three finishers.
      </p>
      {!ready && !error && (
        <div className="d-flex align-items-center gap-2 small mb-3">
          <Spinner size="sm" animation="border" />
          <span>Loading stats...</span>
        </div>
      )}
      {error && (
        <Alert variant="danger" className="small">
          {error}
        </Alert>
      )}
      {ready && <Row>{blocks.map(renderBlock)}</Row>}
      <style jsx global>{`
        .stat-card {
          background: var(--bs-dark-bg-subtle, rgba(255, 255, 255, 0.02));
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 0.5rem;
          padding: 0.75rem 1rem;
        }
        .stat-table thead th {
          background: rgba(255, 255, 255, 0.05);
          font-size: 0.75rem;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .stat-table tbody tr:hover {
          background: rgba(255, 255, 255, 0.04);
        }
      `}</style>
    </TourneyPage>
  );
}
