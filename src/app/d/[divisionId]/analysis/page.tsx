import { Card, Pill, Table, Td, Th } from "@/components/ui";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ divisionId: string }> };

function isMissingTables(err: unknown) {
  return typeof err === "object" && err !== null && "code" in err && (err as { code?: string }).code === "P2021";
}

function pointsForPrediction(args: {
  divisionPointsCorrect: number;
  divisionPointsWrong: number;
  questionCorrectOptionId: string | null;
  questionPointsCorrect: number | null;
  questionPointsWrong: number | null;
  optionResolvedPoints: number | null | undefined;
  predictedOptionId: string;
}) {
  if (args.optionResolvedPoints != null) return args.optionResolvedPoints;
  const pc = args.questionPointsCorrect ?? args.divisionPointsCorrect;
  const pw = args.questionPointsWrong ?? args.divisionPointsWrong;
  if (!args.questionCorrectOptionId) return 0;
  return args.predictedOptionId === args.questionCorrectOptionId ? pc : pw;
}

export default async function DivisionAnalysisPage({ params }: Props) {
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
            <div className="mt-1 text-sm text-zinc-300">테이블이 아직 없어서 분석을 불러올 수 없어요.</div>
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

  const [teams, resolvedQuestions] = await Promise.all([
    prisma.team.findMany({ where: { divisionId, active: true }, orderBy: [{ name: "asc" }] }),
    prisma.question.findMany({
      where: { divisionId, resolvedAt: { not: null } },
      select: {
        id: true,
        title: true,
        questionType: true,
        correctOptionId: true,
        pointsCorrect: true,
        pointsWrong: true,
        options: { select: { id: true, resolvedPoints: true } }
      }
    })
  ]);

  const questionIds = resolvedQuestions.map((q) => q.id);
  const predictions = questionIds.length
    ? await prisma.prediction.findMany({
        where: { questionId: { in: questionIds } },
        select: { teamId: true, questionId: true, optionId: true }
      })
    : [];

  const types = Array.from(
    new Set(resolvedQuestions.map((q) => (q.questionType || "미분류").trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const questionById = new Map(resolvedQuestions.map((q) => [q.id, q] as const));

  const perTeam = teams.map((t) => {
    const byType = new Map<string, { points: number; total: number }>();
    for (const type of types) byType.set(type, { points: 0, total: 0 });

    for (const p of predictions) {
      if (p.teamId !== t.id) continue;
      const q = questionById.get(p.questionId);
      if (!q) continue;
      const type = (q.questionType || "미분류").trim() || "미분류";
      const optionResolvedPoints = q.options.find((o) => o.id === p.optionId)?.resolvedPoints ?? null;
      const pts = pointsForPrediction({
        divisionPointsCorrect: division.pointsCorrect,
        divisionPointsWrong: division.pointsWrong,
        questionCorrectOptionId: q.correctOptionId ?? null,
        questionPointsCorrect: q.pointsCorrect ?? null,
        questionPointsWrong: q.pointsWrong ?? null,
        optionResolvedPoints,
        predictedOptionId: p.optionId
      });
      const row = byType.get(type) ?? { points: 0, total: 0 };
      row.points += pts;
      row.total += 1;
      byType.set(type, row);
    }

    const top = Array.from(byType.entries())
      .filter(([, v]) => v.total > 0)
      .sort((a, b) => b[1].points - a[1].points)
      .slice(0, 3);

    return { team: t, byType, top };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-base text-zinc-400">
            {division.season} · {division.tier}부
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">유형별 성적</h1>
          <div className="mt-3 flex flex-wrap gap-2 text-sm text-zinc-300">
            <Pill>확정 문항 {resolvedQuestions.length}</Pill>
            <Pill>유형 {types.length}</Pill>
          </div>
        </div>
        <Link href={`/d/${division.id}`} className="text-sm text-zinc-300 hover:text-zinc-50">
          순위표로 →
        </Link>
      </div>

      <Card className="space-y-3">
        <div className="text-sm font-semibold">팀별 Top 유형</div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {perTeam.map((t) => (
            <div key={t.team.id} className="rounded-lg border border-zinc-800 px-3 py-3">
              <div className="text-base font-semibold">{t.team.name}</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {t.top.length === 0 && <span className="text-sm text-zinc-400">데이터 없음</span>}
                {t.top.map(([type, v]) => (
                  <Pill key={type}>
                    {type}: {v.points}점 ({v.total})
                  </Pill>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="text-sm font-semibold">유형별 점수 (팀 × 유형)</div>
        <div className="mt-3 overflow-x-auto">
          <Table>
            <thead>
              <tr>
                <Th className="min-w-40">팀</Th>
                {types.map((type) => (
                  <Th key={type} className="min-w-32 text-right">
                    {type}
                  </Th>
                ))}
              </tr>
            </thead>
            <tbody>
              {perTeam.map((t) => (
                <tr key={t.team.id} className="border-t border-zinc-800">
                  <Td className="font-medium">{t.team.name}</Td>
                  {types.map((type) => {
                    const v = t.byType.get(type) ?? { points: 0, total: 0 };
                    return (
                      <Td key={type} className="text-right">
                        {v.total ? (
                          <span>
                            {v.points} <span className="text-zinc-400">({v.total})</span>
                          </span>
                        ) : (
                          <span className="text-zinc-500">-</span>
                        )}
                      </Td>
                    );
                  })}
                </tr>
              ))}
              {teams.length === 0 && (
                <tr className="border-t border-zinc-800">
                  <Td colSpan={types.length + 1} className="py-6 text-center text-sm text-zinc-300">
                    팀이 없어요.
                  </Td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
        <div className="mt-2 text-xs text-zinc-400">괄호는 해당 유형에서 예측이 입력된 문항 수입니다.</div>
      </Card>
    </div>
  );
}

