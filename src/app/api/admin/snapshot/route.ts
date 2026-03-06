import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export async function GET(req: Request) {
  const admin = requireAdmin(req);
  if (!admin.ok) return Response.json({ error: admin.error }, { status: admin.status });

  const [divisions, teams, questions, predictions] = await Promise.all([
    prisma.division.findMany({ orderBy: [{ season: "desc" }, { tier: "asc" }, { name: "asc" }] }),
    prisma.team.findMany({ orderBy: [{ name: "asc" }] }),
    prisma.question.findMany({
      orderBy: [{ createdAt: "desc" }],
      include: { options: { orderBy: [{ order: "asc" }] } }
    }),
    prisma.prediction.findMany({ select: { teamId: true, questionId: true, optionId: true } })
  ]);

  return Response.json({ divisions, teams, questions, predictions });
}

