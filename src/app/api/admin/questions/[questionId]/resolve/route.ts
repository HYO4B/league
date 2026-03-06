import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

const BodySchema = z.object({
  correctOptionId: z.string().nullable()
});

type Props = { params: Promise<{ questionId: string }> };

export async function POST(req: Request, { params }: Props) {
  const admin = requireAdmin(req);
  if (!admin.ok) return Response.json({ error: admin.error }, { status: admin.status });

  const { questionId } = await params;
  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "invalid body" }, { status: 400 });

  const correctOptionId = parsed.data.correctOptionId;
  if (correctOptionId) {
    const option = await prisma.option.findUnique({ where: { id: correctOptionId }, select: { questionId: true } });
    if (!option || option.questionId !== questionId) {
      return Response.json({ error: "correctOptionId does not belong to this question" }, { status: 400 });
    }
  }

  const question = await prisma.question.update({
    where: { id: questionId },
    data: {
      correctOptionId,
      resolvedAt: correctOptionId ? new Date() : null
    }
  });

  return Response.json({ question });
}

