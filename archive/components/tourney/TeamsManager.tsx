"use client";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

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
  showMoneyFields?: boolean;
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

  const inputClasses =
    "w-full rounded-lg border border-border dark:border-border-dark bg-card dark:bg-card-dark px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50";
  const selectClasses = cn(inputClasses, "appearance-auto");

  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold mb-0">Create / Edit Team</h3>
        <button
          type="button"
          className={cn(
            "text-sm px-3 py-1.5 rounded-lg border transition-colors",
            collapsed
              ? "bg-gray-500 text-white border-gray-500"
              : "border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white"
          )}
          onClick={() => setCollapsed((v) => !v)}
        >
          {collapsed ? "Show" : "Hide"}
        </button>
      </div>
      {!collapsed && (
        <>
          <div className="flex items-center gap-3 mb-3">
            <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                role="switch"
                className="h-4 w-4 rounded accent-primary-500"
                checked={hideTotals}
                onChange={(e) => setHideTotals(e.target.checked)}
              />
              Hide totals
            </label>
          </div>
          <div className="rounded-xl border border-border bg-card dark:bg-card-dark dark:border-border-dark shadow-sm mb-3">
            <div className="p-4">
              <h3 className="text-base font-semibold mb-3">Team Details</h3>
              <form>
                <div className="mb-2">
                  <label className="block text-sm font-medium mb-1 text-foreground">
                    Team Name
                  </label>
                  <input
                    type="text"
                    className={inputClasses}
                    value={teamForm.teamName}
                    onChange={(e) =>
                      setTeamForm({ ...teamForm, teamName: e.target.value })
                    }
                    placeholder="e.g., Ghost Hunters"
                  />
                </div>
                <div className="flex gap-3 mb-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1 text-foreground">
                      Member 1
                    </label>
                    <select
                      className={selectClasses}
                      value={teamForm.member1}
                      onChange={(e) =>
                        setTeamForm({ ...teamForm, member1: e.target.value })
                      }
                    >
                      <option value="">Select player...</option>
                      {players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium mb-1 text-foreground">
                      Member 2
                    </label>
                    <select
                      className={selectClasses}
                      value={teamForm.member2}
                      onChange={(e) =>
                        setTeamForm({ ...teamForm, member2: e.target.value })
                      }
                    >
                      <option value="">Select player...</option>
                      {players.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {showMoneyFields && (
                  <div className="flex gap-3 mb-3">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">
                        Member 1 Money
                      </label>
                      <input
                        type="number"
                        className={inputClasses}
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
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground">
                        Member 2 Money
                      </label>
                      <input
                        type="number"
                        className={inputClasses}
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
                    </div>
                  </div>
                )}
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="bg-primary-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                    onClick={async () => {
                      if (!teamForm.teamName.trim()) return;
                      if (
                        !teamForm.member1 ||
                        !teamForm.member2 ||
                        teamForm.member1 === teamForm.member2
                      )
                        return;
                      const _id = await upsertTeam({
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
                  </button>
                  <button
                    type="button"
                    className="bg-gray-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
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
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border dark:border-border-dark">
                  <th className="text-left py-2 px-2">#</th>
                  <th className="text-left py-2 px-2">Team</th>
                  <th className="text-left py-2 px-2">Members</th>
                  <th className="text-left py-2 px-2">Total</th>
                  <th className="text-left py-2 px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((t, idx) => (
                  <tr
                    key={t.id}
                    className="border-b border-border dark:border-border-dark hover:bg-black/5 dark:hover:bg-white/5"
                  >
                    <td className="py-2 px-2">{idx + 1}</td>
                    <td className="py-2 px-2">{t.teamName}</td>
                    <td className="py-2 px-2">
                      {t.members
                        .map((id) => playerNameById[id] || id)
                        .join(" + ")}
                    </td>
                    <td className="py-2 px-2">
                      {!showMoneyFields
                        ? "\u2014"
                        : hideTotals
                          ? "\u2014"
                          : t.totalMoney}
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="text-sm px-3 py-1.5 rounded-lg border border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white transition-colors"
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
                        </button>
                        <button
                          type="button"
                          className="text-sm px-3 py-1.5 rounded-lg border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                          onClick={async () => {
                            await deleteTeam(t.id);
                            const list = await listTeams();
                            setTeams(list);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {teams.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-2 px-2 text-foreground-secondary">
                      No teams yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}