import { prisma } from "@/lib/prisma";
import { formatKstDate, getKstDayRangeUtc } from "@/lib/kst";

function requireCron(req: Request): { ok: true } | { ok: false; status: number; error: string } {
  const configured = process.env.CRON_SECRET;
  if (!configured) return { ok: false, status: 500, error: "CRON_SECRET is not configured" };

  const auth = req.headers.get("authorization");
  if (auth && auth.startsWith("Bearer ")) {
    const token = auth.slice("Bearer ".length).trim();
    if (token === configured) return { ok: true };
  }

  const provided = req.headers.get("x-cron-secret") ?? new URL(req.url).searchParams.get("secret");
  if (!provided) return { ok: false, status: 401, error: "missing cron secret" };
  if (provided !== configured) return { ok: false, status: 403, error: "invalid cron secret" };
  return { ok: true };
}

function requireSlack(): { ok: true; webhookUrl: string } | { ok: false; status: number; error: string } {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return { ok: false, status: 500, error: "SLACK_WEBHOOK_URL is not configured" };
  return { ok: true, webhookUrl };
}

export async function GET(req: Request) {
  const cron = requireCron(req);
  if (!cron.ok) return Response.json({ error: cron.error }, { status: cron.status });

  const slack = requireSlack();
  if (!slack.ok) return Response.json({ error: slack.error }, { status: slack.status });

  // Default: report "yesterday" in KST.
  const daysAgo = Number(new URL(req.url).searchParams.get("daysAgo") ?? "1");
  const safeDaysAgo = Number.isFinite(daysAgo) && daysAgo >= 0 && daysAgo <= 14 ? Math.floor(daysAgo) : 1;
  const { startUtc, endUtc } = getKstDayRangeUtc({ daysAgo: safeDaysAgo });
  const dayLabel = formatKstDate({ daysAgo: safeDaysAgo });

  const [createdQuestions, createdPredictions, resolvedQuestions, createdDivisions, createdTeams] = await Promise.all([
    prisma.question.count({ where: { createdAt: { gte: startUtc, lt: endUtc } } }),
    prisma.prediction.count({ where: { createdAt: { gte: startUtc, lt: endUtc } } }),
    prisma.question.count({ where: { resolvedAt: { gte: startUtc, lt: endUtc } } }),
    prisma.division.count({ where: { createdAt: { gte: startUtc, lt: endUtc } } }),
    prisma.team.count({ where: { createdAt: { gte: startUtc, lt: endUtc } } })
  ]);

  const text =
    `*LLM League Daily Events* (${dayLabel} KST)\n` +
    `• 질문 생성: *${createdQuestions}*\n` +
    `• 예측 입력: *${createdPredictions}*\n` +
    `• 질문 확정(Resolve): *${resolvedQuestions}*\n` +
    `• 디비전 생성: *${createdDivisions}*\n` +
    `• 팀 생성: *${createdTeams}*`;

  const resp = await fetch(slack.webhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text })
  });

  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    return Response.json({ error: "slack webhook failed", status: resp.status, body: body.slice(0, 500) }, { status: 502 });
  }

  return Response.json({
    ok: true,
    dayLabel,
    rangeUtc: { startUtc: startUtc.toISOString(), endUtc: endUtc.toISOString() },
    counts: { createdQuestions, createdPredictions, resolvedQuestions, createdDivisions, createdTeams }
  });
}

