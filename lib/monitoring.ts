export function monitoringEnabled() {
  return Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN);
}

export function captureFrontendError(error: unknown, context: Record<string, unknown> = {}) {
  if (process.env.NODE_ENV !== "production") {
    console.error("WHITE ROCK frontend error", error, context);
  }
}

export function posthogEnabled() {
  if (typeof window === "undefined") return false;
  const consent = localStorage.getItem("whiteRockCookieConsent");
  if (!consent) return false;

  try {
    const parsed = JSON.parse(consent);
    return Boolean(parsed.analytics && process.env.NEXT_PUBLIC_POSTHOG_KEY);
  } catch {
    return false;
  }
}

export function trackClientEvent(event: string, properties: Record<string, unknown> = {}) {
  if (!posthogEnabled()) return;

  if (process.env.NODE_ENV !== "production") {
    console.info("WHITE ROCK analytics", event, properties);
  }
}
