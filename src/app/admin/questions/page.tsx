"use client";

import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { adminFetch } from "@/lib/admin-client";
import { Button, Card, Input, Select, Textarea } from "@/components/ui";

type Division = { id: string; name: string; season: string; tier: number };
type Team = { id: string; divisionId: string; name: string };
type Question = {
  id: string;
  divisionId: string;
  title: string;
  description: string | null;
  resolvedAt: string | null;
  correctOptionId: string | null;
  options: { id: string; label: string; order: number }[];
};

type Prediction = { teamId: string; questionId: string; optionId: string };

const QuestionCreateSchema = z.object({
  divisionId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  options: z.array(z.string().min(1)).min(2).max(8)
});

export default function AdminQuestionsPage() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [draft, setDraft] = useState({
    divisionId: "",
    title: "",
    description: "",
    optionsText: "Yes\nNo"
  });

  async function refresh(divisionId?: string) {
    setError(null);
    const res = await adminFetch("/api/admin/snapshot", { cache: "no-store" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error ?? "스냅샷 조회 실패 (토큰을 저장했는지 확인해 주세요)");
    }
    const data = (await res.json()) as {
      divisions: Division[];
      teams: Team[];
      questions: Question[];
      predictions: Prediction[];
    };
    setDivisions(data.divisions);
    setTeams(data.teams);
    setQuestions(data.questions);
    setPredictions(data.predictions);
    const first = data.divisions[0]?.id ?? "";
    setDraft((d) => ({ ...d, divisionId: d.divisionId || divisionId || first }));
  }

  useEffect(() => {
    refresh().catch((e) => setError(String(e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeDivisionId = draft.divisionId;
  const divisionTeams = useMemo(() => teams.filter((t) => t.divisionId === activeDivisionId).sort((a, b) => a.name.localeCompare(b.name)), [teams, activeDivisionId]);
  const divisionQuestions = useMemo(() => questions.filter((q) => q.divisionId === activeDivisionId).sort((a, b) => (a.resolvedAt ? 1 : 0) - (b.resolvedAt ? 1 : 0)), [questions, activeDivisionId]);

  const predictionsMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of predictions) map.set(`${p.teamId}:${p.questionId}`, p.optionId);
    return map;
  }, [predictions]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">질문/예측 관리</h1>
        <p className="mt-1 text-sm text-zinc-300">질문을 만들고, 팀별 예측을 입력한 뒤 정답을 확정합니다.</p>
      </div>

      {error && <div className="rounded-lg border border-red-900 bg-red-950 px-3 py-2 text-sm">{error}</div>}

      <Card className="space-y-3">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="text-sm font-semibold">디비전 선택</div>
          <Select value={draft.divisionId} onChange={(e) => setDraft((d) => ({ ...d, divisionId: e.target.value }))} className="md:w-96">
            {divisions.map((d) => (
              <option key={d.id} value={d.id}>
                {d.season} · {d.tier}부 · {d.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="text-sm font-semibold">질문 추가</div>
        <Input value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="질문 제목 (예: 2026-03-10 BTC가 10만 달러를 넘을까?)" />
        <Textarea value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} placeholder="설명(선택)" />
        <div className="text-xs text-zinc-400">선택지 (줄바꿈으로 구분, 최소 2개)</div>
        <Textarea value={draft.optionsText} onChange={(e) => setDraft((d) => ({ ...d, optionsText: e.target.value }))} />
        <div>
          <Button
            onClick={async () => {
              setError(null);
              const options = draft.optionsText
                .split("\n")
                .map((s) => s.trim())
                .filter(Boolean);
              const parsed = QuestionCreateSchema.safeParse({
                divisionId: draft.divisionId,
                title: draft.title,
                description: draft.description || undefined,
                options
              });
              if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "입력 오류");
              const resp = await adminFetch("/api/admin/questions", { method: "POST", body: JSON.stringify(parsed.data) });
              if (!resp.ok) return setError((await resp.json()).error ?? "생성 실패");
              setDraft((d) => ({ ...d, title: "", description: "" }));
              await refresh(draft.divisionId);
            }}
          >
            생성
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        {divisionQuestions.map((q) => (
          <Card key={q.id} className="space-y-3">
            <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between md:gap-4">
              <div className="min-w-0">
                <div className="text-sm font-semibold">{q.title}</div>
                {q.description && <div className="mt-1 text-sm text-zinc-300">{q.description}</div>}
                <div className="mt-2 flex flex-wrap gap-2">
                  {q.options
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((o) => (
                      <span key={o.id} className="rounded-full border border-zinc-700 px-2 py-1 text-xs text-zinc-200">
                        {o.label}
                      </span>
                    ))}
                </div>
              </div>
              <div className="text-xs text-zinc-400">
                {q.resolvedAt ? `확정됨: ${new Date(q.resolvedAt).toLocaleString("ko-KR")}` : "미확정"}
              </div>
            </div>

            <div className="rounded-lg border border-zinc-800 p-3">
              <div className="text-xs font-semibold text-zinc-200">예측 입력</div>
              <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                {divisionTeams.map((t) => {
                  const key = `${t.id}:${q.id}`;
                  const current = predictionsMap.get(key) ?? "";
                  return (
                    <div key={key} className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 px-3 py-2">
                      <div className="text-sm">{t.name}</div>
                      <Select
                        value={current}
                        onChange={async (e) => {
                          setError(null);
                          const optionId = e.target.value;
                          const resp = await adminFetch("/api/admin/predictions", {
                            method: "POST",
                            body: JSON.stringify({ teamId: t.id, questionId: q.id, optionId })
                          });
                          if (!resp.ok) return setError((await resp.json()).error ?? "저장 실패");
                          await refresh(draft.divisionId);
                        }}
                        className="w-48"
                      >
                        <option value="">선택</option>
                        {q.options
                          .slice()
                          .sort((a, b) => a.order - b.order)
                          .map((o) => (
                            <option key={o.id} value={o.id}>
                              {o.label}
                            </option>
                          ))}
                      </Select>
                    </div>
                  );
                })}
                {divisionTeams.length === 0 && <div className="text-sm text-zinc-300">이 디비전에 팀이 없어요.</div>}
              </div>
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="text-xs text-zinc-400">정답 확정</div>
              <div className="flex items-center gap-2">
                <Select
                  value={q.correctOptionId ?? ""}
                  onChange={async (e) => {
                    setError(null);
                    const correctOptionId = e.target.value || null;
                    const resp = await adminFetch(`/api/admin/questions/${q.id}/resolve`, {
                      method: "POST",
                      body: JSON.stringify({ correctOptionId })
                    });
                    if (!resp.ok) return setError((await resp.json()).error ?? "확정 실패");
                    await refresh(draft.divisionId);
                  }}
                  className="w-64"
                >
                  <option value="">미확정</option>
                  {q.options
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.label}
                      </option>
                    ))}
                </Select>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    setError(null);
                    const resp = await adminFetch(`/api/admin/questions/${q.id}/resolve`, {
                      method: "POST",
                      body: JSON.stringify({ correctOptionId: null })
                    });
                    if (!resp.ok) return setError((await resp.json()).error ?? "해제 실패");
                    await refresh(draft.divisionId);
                  }}
                >
                  해제
                </Button>
              </div>
            </div>
          </Card>
        ))}

        {divisionQuestions.length === 0 && (
          <Card>
            <div className="text-sm text-zinc-300">이 디비전에 질문이 없어요.</div>
          </Card>
        )}
      </div>
    </div>
  );
}
