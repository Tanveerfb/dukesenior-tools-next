"use client";
import { useEffect, useMemo, useState } from "react";
import { Button, Card, Form, Stack, Table } from "react-bootstrap";

interface Player {
  id: string;
  name: string;
}

export default function TeamsManager(props: {
  players: Player[];
  listTeams: () => Promise<
    Array<{
      id: string;
      teamName: string;
      members: string[];
      totalMoney: number;
    }>
  >;
  upsertTeam: (params: {
    teamId?: string;
    teamName: string;
    members: string[];
    memberMoney?: Record<string, number>;
  }) => Promise<string>;
  deleteTeam: (teamId: string) => Promise<void>;
  showMoneyFields?: boolean; // rounds 2 & 3 only
}) {
  const {
    players,
    listTeams,
    upsertTeam,
    deleteTeam,
    showMoneyFields = true,
  } = props;
  const [teams, setTeams] = useState<
    Array<{
      id: string;
      teamName: string;
      members: string[];
      totalMoney: number;
    }>
  >([]);
  const [hideTotals, setHideTotals] = useState(false);
  const [teamForm, setTeamForm] = useState<{
    teamId?: string;
    teamName: string;
    member1: string;
    member2: string;
    memberMoney: Record<string, number>;
  }>({
    teamId: undefined,
    teamName: "",
    member1: "",
    member2: "",
    memberMoney: {},
  });
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const list = await listTeams();
        setTeams(list);
      } catch {}
    })();
  }, [listTeams]);

  const playerNameById = useMemo(() => {
    const map: Record<string, string> = {};
    players.forEach((p) => (map[p.id] = p.name));
    return map;
  }, [players]);

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h3 className="h6 mb-0">Create / Edit Team</h3>
        <Button
          variant={collapsed ? "secondary" : "outline-secondary"}
          onClick={() => setCollapsed((v) => !v)}
        >
          {collapsed ? "Show" : "Hide"}
        </Button>
      </div>
      {!collapsed && (
        <>
          <Stack direction="horizontal" gap={3} className="mb-3">
            <Form.Check
              type="switch"
              id="hideTotalsSwitch"
              label="Hide totals"
              checked={hideTotals}
              onChange={(e) => setHideTotals(e.target.checked)}
            />
          </Stack>
          <Card className="border-0 shadow-sm mb-3">
            <Card.Body>
              <Card.Title as="h3" className="h6">
                Team Details
              </Card.Title>
              <Form>
                <Form.Group className="mb-2">
                  <Form.Label>Team Name</Form.Label>
                  <Form.Control
                    value={teamForm.teamName}
                    onChange={(e) =>
                      setTeamForm({ ...teamForm, teamName: e.target.value })
                    }
                    placeholder="e.g., Ghost Hunters"
                  />
                </Form.Group>
                <Stack direction="horizontal" gap={3} className="mb-2">
                  <Form.Group className="flex-fill">
                    <Form.Label>Member 1</Form.Label>
                    <Form.Select
                      value={teamForm.member1}
                      onChange={(e) =>
                        setTeamForm({ ...teamForm, member1: e.target.value })
                      }
                    >
                      <option value="">Select player…</option>
                      {players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="flex-fill">
                    <Form.Label>Member 2</Form.Label>
                    <Form.Select
                      value={teamForm.member2}
                      onChange={(e) =>
                        setTeamForm({ ...teamForm, member2: e.target.value })
                      }
                    >
                      <option value="">Select player…</option>
                      {players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Stack>
                {showMoneyFields && (
                  <Stack direction="horizontal" gap={3} className="mb-3">
                    <Form.Group>
                      <Form.Label>Member 1 Money</Form.Label>
                      <Form.Control
                        type="number"
                        value={teamForm.memberMoney[teamForm.member1] || 0}
                        onChange={(e) =>
                          setTeamForm({
                            ...teamForm,
                            memberMoney: {
                              ...teamForm.memberMoney,
                              [teamForm.member1]: Number(e.target.value || 0),
                            },
                          })
                        }
                        disabled={!teamForm.member1}
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label>Member 2 Money</Form.Label>
                      <Form.Control
                        type="number"
                        value={teamForm.memberMoney[teamForm.member2] || 0}
                        onChange={(e) =>
                          setTeamForm({
                            ...teamForm,
                            memberMoney: {
                              ...teamForm.memberMoney,
                              [teamForm.member2]: Number(e.target.value || 0),
                            },
                          })
                        }
                        disabled={!teamForm.member2}
                      />
                    </Form.Group>
                  </Stack>
                )}
                <Stack direction="horizontal" gap={3}>
                  <Button
                    variant="primary"
                    onClick={async () => {
                      if (!teamForm.teamName.trim()) return;
                      if (
                        !teamForm.member1 ||
                        !teamForm.member2 ||
                        teamForm.member1 === teamForm.member2
                      )
                        return;
                      const id = await upsertTeam({
                        teamId: teamForm.teamId,
                        teamName: teamForm.teamName.trim(),
                        members: [teamForm.member1, teamForm.member2],
                        memberMoney: showMoneyFields
                          ? teamForm.memberMoney
                          : {},
                      });
                      const list = await listTeams();
                      setTeams(list);
                      setTeamForm({
                        teamId: undefined,
                        teamName: "",
                        member1: "",
                        member2: "",
                        memberMoney: {},
                      });
                    }}
                  >
                    Save Team
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setTeamForm({
                        teamId: undefined,
                        teamName: "",
                        member1: "",
                        member2: "",
                        memberMoney: {},
                      })
                    }
                  >
                    Reset
                  </Button>
                </Stack>
              </Form>
            </Card.Body>
          </Card>
          <Table responsive size="sm">
            <thead>
              <tr>
                <th>#</th>
                <th>Team</th>
                <th>Members</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.map((t, idx) => (
                <tr key={t.id}>
                  <td>{idx + 1}</td>
                  <td>{t.teamName}</td>
                  <td>
                    {t.members
                      .map((id) => playerNameById[id] || id)
                      .join(" + ")}
                  </td>
                  <td>
                    {!showMoneyFields ? "—" : hideTotals ? "—" : t.totalMoney}
                  </td>
                  <td>
                    <Stack direction="horizontal" gap={2}>
                      <Button
                        size="sm"
                        variant="outline-primary"
                        onClick={() => {
                          const m1 = t.members[0] || "";
                          const m2 = t.members[1] || "";
                          setTeamForm({
                            teamId: t.id,
                            teamName: t.teamName,
                            member1: m1,
                            member2: m2,
                            memberMoney: {},
                          });
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={async () => {
                          await deleteTeam(t.id);
                          const list = await listTeams();
                          setTeams(list);
                        }}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </td>
                </tr>
              ))}
              {teams.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-muted">
                    No teams yet.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </>
      )}
    </>
  );
}
