export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export function getApiUrl(url = "") {
  if (/^https?:\/\//i.test(url)) return url;
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL manquant");
  }

  const path = url.startsWith("/") ? url : `/${url}`;
  return `${API_BASE_URL}${path}`;
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;

  localStorage.removeItem("token");
  localStorage.removeItem("access_token");
  localStorage.removeItem("activeWorkspaceId");
}

export function isJwtExpired(token?: string | null) {
  if (!token) return true;

  try {
    const encodedPayload = token.split(".")[1] || "";
    const normalizedPayload = encodedPayload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(encodedPayload.length / 4) * 4, "=");
    const payload = JSON.parse(atob(normalizedPayload));
    const exp = Number(payload.exp || 0);
    if (!exp) return true;
    return Date.now() >= exp * 1000 - 30_000;
  } catch {
    return true;
  }
}

export function redirectToLogin(reason = "session_expired") {
  if (typeof window === "undefined") return;

  clearAuthSession();
  const next = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.assign(`/login?reason=${reason}&next=${next}`);
}

type ApiError = Error & { payload?: unknown; status?: number };

export async function apiFetch<T>(
  url: string,
  token?: string | null,
  options: RequestInit = {}
): Promise<T> {
  if (token && isJwtExpired(token)) {
    redirectToLogin();
    throw new Error("Session expiree");
  }

  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (typeof window !== "undefined") {
    const workspaceId = localStorage.getItem("activeWorkspaceId");

    if (workspaceId) {
      headers.set("X-Workspace-Id", workspaceId);
    }
  }

  let res: Response;
  try {
    res = await fetch(getApiUrl(url), {
      ...options,
      headers,
    });
  } catch (err) {
    console.error("NETWORK ERROR:", err);
    throw err;
  }

  if (!res.ok) {
    if (res.status === 401) {
      redirectToLogin();
    }

    const body = await res.text();
    let message = body || "Service indisponible";
    let payload: unknown;
    try {
      const parsed = JSON.parse(body);
      payload = parsed;
      message = parsed.detail || parsed.message || message;
    } catch {
      // Keep the raw service body when it is not JSON.
    }
    const error = new Error(message) as ApiError;
    error.payload = payload;
    error.status = res.status;
    throw error;
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}
