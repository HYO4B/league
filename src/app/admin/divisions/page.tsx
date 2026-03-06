"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { Button, Card, Input, Select } from "@/components/ui";
import { adminFetch } from "@/lib/admin-client";

type Division = {
  id: string;
  name: string;
  season: string;
  tier: number;
  pointsCorrect: number;
  pointsWrong: number;
};

type Team = { id: string; divisionId: string; name: string; provider: string | null; active: boolean };

const DivisionCreateSchema = z.object({
  season: z.string().min(1),
  tier: z.coerce.number().int().min(1),
  name: z.string().min(1),
  pointsCorrect: z.coerce.number().int().min(0).default(3),
  pointsWrong: z.coerce.number().int().min(0).default(0)
});

const TeamCreateSchema = z.object({
  divisionId: z.string().min(1),
  name: z.string().min(1),
  provider: z.string().optional()
});

export default function AdminDivisionsPage() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [newDivision, setNewDivision] = useState({
    season: "2026 S1",
    tier: 1,
    name: "1부 리그",
    pointsCorrect: 3,
    pointsWrong: 0
  });

  const [newTeam, setNewTeam] = useState({
    divisionId: "",
    name: "",
    provider: ""
  });

  async function refresh() {
    setError(null);
    const res = await adminFetch("/api/admin/snapshot", { cache: "no-store" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error ?? "스냅샷 조회 실패 (토큰을 저장했는지 확인해 주세요)");
    }
    const data = (await res.json()) as { divisions: Division[]; teams: Team[] };
    setDivisions(data.divisions);
    setTeams(data.teams);
    if (!newTeam.divisionId && data.divisions[0]) setNewTeam((t) => ({ ...t, divisionId: data.divisions[0].id }));
  }

  useEffect(() => {
    refresh().catch((e) => setError(String(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const teamsByDivision = useMemo(() => {
    const map = new Map<string, Team[]>();
    for (const t of teams) {
      const arr = map.get(t.divisionId) ?? [];
      arr.push(t);
      map.set(t.divisionId, arr);
    }
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => a.name.localeCompare(b.name));
      map.set(k, arr);
    }
    return map;
  }, [teams]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">디비전/팀 관리</h1>
        <p className="mt-1 text-sm text-zinc-300">디비전을 만들고, 각 디비전에 팀(모델)을 추가합니다.</p>
      </div>

      {error && <div className="rounded-lg border border-red-900 bg-red-950 px-3 py-2 text-sm">{error}</div>}

      <Card className="space-y-3">
        <div className="text-sm font-semibold">디비전 추가</div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-5">
          <Input value={newDivision.season} onChange={(e) => setNewDivision((d) => ({ ...d, season: e.target.value }))} placeholder="시즌 (예: 2026 S1)" />
          <Input value={newDivision.tier} onChange={(e) => setNewDivision((d) => ({ ...d, tier: Number(e.target.value) }))} placeholder="티어 (1,2…)" />
          <Input value={newDivision.name} onChange={(e) => setNewDivision((d) => ({ ...d, name: e.target.value }))} placeholder="디비전 이름" />
          <Input value={newDivision.pointsCorrect} onChange={(e) => setNewDivision((d) => ({ ...d, pointsCorrect: Number(e.target.value) }))} placeholder="정답 점수" />
          <Input value={newDivision.pointsWrong} onChange={(e) => setNewDivision((d) => ({ ...d, pointsWrong: Number(e.target.value) }))} placeholder="오답 점수" />
        </div>
        <div>
          <Button
            onClick={async () => {
              setError(null);
              const parsed = DivisionCreateSchema.safeParse(newDivision);
              if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "입력 오류");
              const resp = await adminFetch("/api/admin/divisions", {
                method: "POST",
                body: JSON.stringify(parsed.data)
              });
              if (!resp.ok) return setError((await resp.json()).error ?? "생성 실패");
              await refresh();
            }}
          >
            생성
          </Button>
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="text-sm font-semibold">팀 추가</div>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
          <Select value={newTeam.divisionId} onChange={(e) => setNewTeam((t) => ({ ...t, divisionId: e.target.value }))}>
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.season} · {d.tier}부 · {d.name}
              </option>
            ))}
          </Select>
          <Input value={newTeam.name} onChange={(e) => setNewTeam((t) => ({ ...t, name: e.target.value }))} placeholder="팀 이름 (예: GPT)" />
          <Input value={newTeam.provider} onChange={(e) => setNewTeam((t) => ({ ...t, provider: e.target.value }))} placeholder="제공사/메모 (예: OpenAI)" />
        </div>
        <div>
          <Button
            onClick={async () => {
              setError(null);
              const parsed = TeamCreateSchema.safeParse(newTeam);
              if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "입력 오류");
              const resp = await adminFetch("/api/admin/teams", {
                method: "POST",
                body: JSON.stringify(parsed.data)
              });
              if (!resp.ok) return setError((await resp.json()).error ?? "생성 실패");
              setNewTeam((t) => ({ ...t, name: "", provider: "" }));
              await refresh();
            }}
          >
            생성
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        {divisions.map((d) => (
          <Card key={d.id} className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs text-zinc-400">
                  {d.season} · {d.tier}부
                </div>
                <div className="text-sm font-semibold">{d.name}</div>
              </div>
              <div className="text-xs text-zinc-400">
                정답 {d.pointsCorrect} / 오답 {d.pointsWrong}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              {(teamsByDivision.get(d.id) ?? []).map((t) => (
                <div key={t.id} className="rounded-lg border border-zinc-800 px-3 py-2">
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs text-zinc-400">{t.provider ?? ""}</div>
                </div>
              ))}
              {(teamsByDivision.get(d.id) ?? []).length === 0 && <div className="text-sm text-zinc-300">팀이 없어요.</div>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
