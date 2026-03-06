import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

const BodySchema = z.object({
  divisionId: z.string().min(1),
  name: z.string().min(1),
  provider: z.string().optional()
});

export async function POST(req: Request) {
  const admin = requireAdmin(req);
  if (!admin.ok) return Response.json({ error: admin.error }, { status: admin.status });

  const json = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "invalid body" }, { status: 400 });

  const team = await prisma.team.create({
    data: {
      divisionId: parsed.data.divisionId,
      name: parsed.data.name,
      provider: parsed.data.provider ?? null
    }
  });

  return Response.json({ team });
}

