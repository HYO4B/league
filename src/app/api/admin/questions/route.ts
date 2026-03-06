import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

const BodySchema = z.object({
  divisionId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  options: z.array(z.string().min(1)).min(2).max(8)
});

export async function POST(req: Request) {
  const admin = requireAdmin(req);
  if (!admin.ok) return Response.json({ error: admin.error }, { status: admin.status });

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "invalid body" }, { status: 400 });

  const question = await prisma.question.create({
    data: {
      divisionId: parsed.data.divisionId,
      title: parsed.data.title,
      description: parsed.data.description ?? null,
      options: {
        create: parsed.data.options.map((label, idx) => ({ label, order: idx + 1 }))
      }
    },
    include: { options: { orderBy: [{ order: "asc" }] } }
  });

  return Response.json({ question });
}

