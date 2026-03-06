import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

const BodySchema = z.object({
  teamId: z.string().min(1),
  questionId: z.string().min(1),
  optionId: z.string().min(1)
});

export async function POST(req: Request) {
  const admin = requireAdmin(req);
  if (!admin.ok) return Response.json({ error: admin.error }, { status: admin.status });

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "invalid body" }, { status: 400 });

  const { teamId, questionId, optionId } = parsed.data;

  const prediction = await prisma.prediction.upsert({
    where: { teamId_questionId: { teamId, questionId } },
    create: { teamId, questionId, optionId },
    update: { optionId }
  });

  return Response.json({ prediction });
}

