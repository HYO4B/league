import { prisma } from "@/lib/prisma";
import { formatNowKstDate } from "@/lib/kst";
import { createHash } from "node:crypto";

function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "0.0.0.0";
}

function looksLikeBot(ua: string) {
  const s = ua.toLowerCase();
  return s.includes("bot") || s.includes("spider") || s.includes("crawler") || s.includes("headless");
}

export async function POST(req: Request) {
  // Very lightweight, best-effort analytics: daily aggregates only.
  const json = await req.json().catch(() => null);
  const path = typeof json?.path === "string" ? json.path.slice(0, 200) : "/";
  const ua = req.headers.get("user-agent") ?? "";
  if (looksLikeBot(ua)) return Response.json({ ok: true, ignored: "bot" });

  const dayKst = formatNowKstDate();
  const ip = getClientIp(req);
  const visitorHash = createHash("sha256").update(`${ip}|${ua}|${dayKst}`).digest("hex");

  await prisma.dailyTraffic.upsert({
    where: { dayKst },
    create: { dayKst, pageviews: 1, visitors: 0 },
    update: { pageviews: { increment: 1 } }
  });

  // Count unique visitors per day (hashed; rotates daily via dayKst).
  let createdVisitor = false;
  try {
    await prisma.dailyVisitor.create({ data: { dayKst, visitorHash } });
    createdVisitor = true;
  } catch (e) {
    // Unique constraint violation -> already counted.
    const code = typeof e === "object" && e !== null && "code" in e ? (e as { code?: string }).code : undefined;
    if (code !== "P2002") throw e;
  }

  if (createdVisitor) {
    await prisma.dailyTraffic.update({
      where: { dayKst },
      data: { visitors: { increment: 1 } }
    });
  }

  return Response.json({ ok: true, dayKst, path });
}

