export function requireAdmin(req: Request): { ok: true } | { ok: false; status: number; error: string } {
  const configured = process.env.ADMIN_TOKEN;
  if (!configured) return { ok: false, status: 500, error: "ADMIN_TOKEN is not configured" };

  const provided = req.headers.get("x-admin-token");
  if (!provided) return { ok: false, status: 401, error: "missing x-admin-token" };
  if (provided !== configured) return { ok: false, status: 403, error: "invalid admin token" };
  return { ok: true };
}

