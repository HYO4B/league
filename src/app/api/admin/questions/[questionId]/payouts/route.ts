import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

type Props = { params: Promise<{ questionId: string }> };

const BodySchema = z.object({
  payouts: z
    .array(
      z.object({
        optionId: z.string().min(1),
        points: z.number().int()
      })
    )
    .default([]),
  finalize: z.boolean().optional().default(false),
  clear: z.boolean().optional().default(false)
});

export async function POST(req: Request, { params }: Props) {
  const admin = requireAdmin(req);
  if (!admin.ok) return Response.json({ error: admin.error }, { status: admin.status });

  const { questionId } = await params;
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "invalid body" }, { status: 400 });

  const question = await prisma.question.findUnique({
    where: { id: questionId },
    include: { options: { orderBy: [{ order: "asc" }] } }
  });
  if (!question) return Response.json({ error: "question not found" }, { status: 404 });

  if (parsed.data.clear) {
    await prisma.$transaction([
      prisma.option.updateMany({ where: { questionId }, data: { resolvedPoints: null } }),
      prisma.question.update({ where: { id: questionId }, data: { resolvedAt: null, correctOptionId: null } })
    ]);
    return Response.json({ ok: true, cleared: true });
  }

  const payoutMap = new Map<string, number>();
  for (const p of parsed.data.payouts) payoutMap.set(p.optionId, p.points);

  // Fill missing options with 0 points so scoring is deterministic.
  const optionUpdates = question.options.map((o) => {
    const points = payoutMap.has(o.id) ? payoutMap.get(o.id)! : 0;
    return prisma.option.update({ where: { id: o.id }, data: { resolvedPoints: points } });
  });

  const max = Math.max(...question.options.map((o) => (payoutMap.has(o.id) ? payoutMap.get(o.id)! : 0)));
  const winner = question.options.find((o) => (payoutMap.has(o.id) ? payoutMap.get(o.id)! : 0) === max) ?? null;

  const questionUpdate = prisma.question.update({
    where: { id: questionId },
    data: {
      // Keep legacy "correctOptionId" in sync for "적중" metrics.
      correctOptionId: winner?.id ?? null,
      resolvedAt: parsed.data.finalize ? new Date() : question.resolvedAt
    }
  });

  await prisma.$transaction([...optionUpdates, questionUpdate]);
  return Response.json({ ok: true });
}

