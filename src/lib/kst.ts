const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function getKstDayRangeUtc(opts?: { daysAgo?: number }) {
  const daysAgo = opts?.daysAgo ?? 0;
  const nowMs = Date.now();
  const kstNow = new Date(nowMs + KST_OFFSET_MS);

  const kstMidnightMs = Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate());
  const startUtcMs = kstMidnightMs - KST_OFFSET_MS - daysAgo * 24 * 60 * 60 * 1000;
  const endUtcMs = startUtcMs + 24 * 60 * 60 * 1000;

  return { startUtc: new Date(startUtcMs), endUtc: new Date(endUtcMs) };
}

export function formatKstDate(opts?: { daysAgo?: number }) {
  const daysAgo = opts?.daysAgo ?? 0;
  const { startUtc } = getKstDayRangeUtc({ daysAgo });
  const kstMs = startUtc.getTime() + KST_OFFSET_MS;
  const d = new Date(kstMs);
  const yyyy = String(d.getUTCFullYear());
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function formatNowKstDate() {
  const nowMs = Date.now();
  const kstNow = new Date(nowMs + KST_OFFSET_MS);
  const yyyy = String(kstNow.getUTCFullYear());
  const mm = String(kstNow.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(kstNow.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
