import { prisma } from "@/lib/prisma";
import { Card, Pill, Table, Th, Td } from "@/components/ui";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ divisionId: string }> };

function isMissingTables(err: unknown) {
  return typeof err === "object" && err !== null && "code" in err && (err as { code?: string }).code === "P2021";
}

function pct(numerator: number, denominator: number) {
  if (denominator === 0) return "0%";
  return `${Math.round((numerator / denominator) * 1000) / 10}%`;
}

export default async function DivisionPage({ params }: Props) {
  const { divisionId } = await params;

  let division: { id: string; name: string; season: string; tier: number; pointsCorrect: number; pointsWrong: number } | null = null;
  try {
    division = await prisma.division.findUnique({ where: { id: divisionId } });
  } catch (e) {
    if (isMissingTables(e)) {
      return (
        <div className="space-y-4">
          <Card>
            <div className="text-sm font-semibold">DB 마이그레이션이 필요합니다</div>
            <div className="mt-1 text-sm text-zinc-300">
              테이블이 아직 없어서 순위표를 불러올 수 없어요. Vercel에서 `DIRECT_URL(5432)`을 설정하고 Redeploy 해주세요.
            </div>
          </Card>
          <Link href="/admin" className="text-sm text-zinc-300 hover:text-zinc-50">
            관리자 페이지로 →
          </Link>
        </div>
      );
    }
    throw e;
  }
  if (!division) return <div className="text-sm text-zinc-300">없는 디비전입니다.</div>;

  const teams = await prisma.team.findMany({
    where: { divisionId, active: true },
    orderBy: [{ name: "asc" }]
  });

  const resolvedQuestions = await prisma.question.findMany({
    where: { divisionId, resolvedAt: { not: null }, correctOptionId: { not: null } },
    select: { id: true, correctOptionId: true, resolvedAt: true, title: true, pointsCorrect: true, pointsWrong: true },
    orderBy: [{ resolvedAt: "desc" }],
  });

  const resolvedQuestionIds = resolvedQuestions.map((q) => q.id);
  const predictions = resolvedQuestionIds.length
    ? await prisma.prediction.findMany({
        where: { questionId: { in: resolvedQuestionIds } },
        select: { teamId: true, questionId: true, optionId: true }
      })
    : [];

  const standings = teams
    .map((t) => {
      let correct = 0;
      let total = 0;
      for (const q of resolvedQuestions) {
        const p = predictions.find((x) => x.teamId === t.id && x.questionId === q.id);
        if (!p) continue;
        total += 1;
        if (p.optionId === q.correctOptionId) correct += 1;
      }
      const points = resolvedQuestions.reduce((acc, q) => {
        const p = predictions.find((x) => x.teamId === t.id && x.questionId === q.id);
        if (!p) return acc;
        const pc = q.pointsCorrect ?? division.pointsCorrect;
        const pw = q.pointsWrong ?? division.pointsWrong;
        return acc + (p.optionId === q.correctOptionId ? pc : pw);
      }, 0);
      return { team: t, points, correct, total };
    })
    .sort((a, b) => b.points - a.points || b.correct - a.correct || a.team.name.localeCompare(b.team.name));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-base text-zinc-400">
            {division.season} · {division.tier}부
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{division.name}</h1>
          <div className="mt-3 flex flex-wrap gap-2 text-sm text-zinc-300">
            <Pill>정답 {division.pointsCorrect}점</Pill>
            <Pill>오답 {division.pointsWrong}점</Pill>
          </div>
        </div>
        <Link href="/admin" className="text-sm text-zinc-300 hover:text-zinc-50">
          관리자에서 입력하기 →
        </Link>
      </div>

      <Card>
        <div className="text-sm font-semibold">순위표 (확정 문항 기준)</div>
        <div className="mt-3 overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <Th className="w-16">순위</Th>
                <Th>팀</Th>
                <Th className="w-24 text-right">승점</Th>
                <Th className="w-24 text-right">적중</Th>
                <Th className="w-28 text-right">적중률</Th>
              </tr>
            </thead>
            <tbody>
              {standings.map((s, idx) => (
                <tr key={s.team.id} className="border-t border-zinc-800">
                  <Td className="text-zinc-400">{idx + 1}</Td>
                  <Td>
                    <div className="font-medium">{s.team.name}</div>
                    {s.team.provider && <div className="text-xs text-zinc-400">{s.team.provider}</div>}
                  </Td>
                  <Td className="text-right font-semibold">{s.points}</Td>
                  <Td className="text-right">
                    {s.correct}/{s.total}
                  </Td>
                  <Td className="text-right">{pct(s.correct, s.total)}</Td>
                </tr>
              ))}
              {standings.length === 0 && (
                <tr className="border-t border-zinc-800">
                  <Td colSpan={5} className="py-6 text-center text-sm text-zinc-300">
                    팀/질문이 아직 없어요. `/admin`에서 추가해 주세요.
                  </Td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold">최근 확정 질문</div>
          <div className="text-xs text-zinc-400">최신 {resolvedQuestions.length}개</div>
        </div>
        <div className="mt-3 space-y-2">
          {resolvedQuestions.map((q) => (
            <div key={q.id} className="flex items-center justify-between gap-3 rounded-lg border border-zinc-800 px-3 py-2">
              <div className="text-sm">{q.title}</div>
              <div className="text-xs text-zinc-400">{q.resolvedAt ? new Date(q.resolvedAt).toLocaleString("ko-KR") : ""}</div>
            </div>
          ))}
          {resolvedQuestions.length === 0 && <div className="text-sm text-zinc-300">아직 확정된 질문이 없어요.</div>}
        </div>
      </Card>
    </div>
  );
}
