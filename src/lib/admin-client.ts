const STORAGE_KEY = "llm-league-admin-token";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(STORAGE_KEY);
}

export async function adminFetch(input: RequestInfo | URL, init?: RequestInit) {
  const token = getAdminToken();
  const headers = new Headers(init?.headers ?? undefined);
  if (token) headers.set("x-admin-token", token);
  if (init?.body && !headers.has("content-type")) headers.set("content-type", "application/json");
  return fetch(input, { ...init, headers });
}

