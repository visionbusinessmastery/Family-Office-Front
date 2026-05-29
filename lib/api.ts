export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://family-office-api-n4sv.onrender.com";

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

export async function apiRequest<T>(
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

  const res = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    if (res.status === 401) {
      redirectToLogin();
    }

    const body = await res.text();
    let message = body || "Erreur API";
    try {
      const parsed = JSON.parse(body);
      message = parsed.detail || parsed.message || message;
    } catch {
      // Keep the raw API body when it is not JSON.
    }
    throw new Error(message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return (await res.json()) as T;
}
