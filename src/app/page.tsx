import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui";

export default async function HomePage() {
  const divisions = await prisma.division.findMany({
    orderBy: [{ season: "desc" }, { tier: "asc" }, { name: "asc" }],
    include: { _count: { select: { teams: true, questions: true } } }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">디비전</h1>
        <p className="mt-1 text-sm text-zinc-300">디비전을 선택하면 순위표를 볼 수 있어요.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {divisions.map((d) => (
          <Link key={d.id} href={`/d/${d.id}`}>
            <Card className="hover:border-zinc-600">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm text-zinc-400">
                    {d.season} · {d.tier}부
                  </div>
                  <div className="mt-1 text-lg font-semibold">{d.name}</div>
                </div>
                <div className="text-right text-xs text-zinc-400">
                  <div>팀 {d._count.teams}</div>
                  <div>질문 {d._count.questions}</div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
        {divisions.length === 0 && (
          <Card>
            <div className="text-sm text-zinc-300">
              아직 디비전이 없어요. `/admin`에서 만들 수 있어요.
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

