import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

const DEFAULT_TEAMS: { name: string; provider: string }[] = [
  { name: "GPT", provider: "OpenAI" },
  { name: "Claude", provider: "Anthropic" },
  { name: "Perplexity", provider: "Perplexity" },
  { name: "Gemini", provider: "Google" },
  { name: "Grok", provider: "xAI" },
  { name: "GLM", provider: "Zhipu AI" }
];

export async function POST(req: Request) {
  const admin = requireAdmin(req);
  if (!admin.ok) return Response.json({ error: admin.error }, { status: admin.status });

  const year = new Date().getFullYear();
  const season = `${year} S1`;

  const division = await prisma.division.upsert({
    where: { season_tier_name: { season, tier: 1, name: "1부 리그" } },
    create: {
      season,
      tier: 1,
      name: "1부 리그",
      pointsCorrect: 3,
      pointsWrong: 0
    },
    update: {}
  });

  await prisma.$transaction(
    DEFAULT_TEAMS.map((t) =>
      prisma.team.upsert({
        where: { divisionId_name: { divisionId: division.id, name: t.name } },
        create: { divisionId: division.id, name: t.name, provider: t.provider },
        update: { provider: t.provider, active: true }
      })
    )
  );

  return Response.json({ division, teams: DEFAULT_TEAMS });
}

