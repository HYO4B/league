import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

const BodySchema = z.object({
  season: z.string().min(1),
  tier: z.number().int().min(1),
  name: z.string().min(1),
  pointsCorrect: z.number().int().min(0).default(3),
  pointsWrong: z.number().int().min(0).default(0)
});

export async function POST(req: Request) {
  const admin = requireAdmin(req);
  if (!admin.ok) return Response.json({ error: admin.error }, { status: admin.status });

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "invalid body" }, { status: 400 });

  const division = await prisma.division.create({ data: parsed.data });
  return Response.json({ division });
}

