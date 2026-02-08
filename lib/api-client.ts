/**
 * API client with CSRF token support for mutating requests to same-origin /api/* routes
 */

const CSRF_HEADER_NAME = "x-csrf-token";

let csrfTokenCache: string | null = null;

/**
 * Fetch and cache CSRF token. Call this early (e.g. on app load) to prime the cache.
 */
export async function getCsrfToken(): Promise<string> {
  if (csrfTokenCache) return csrfTokenCache;
  const res = await fetch("/api/csrf", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to get CSRF token");
  const { token } = await res.json();
  csrfTokenCache = token;
  return token;
}

/**
 * Fetch wrapper that automatically adds CSRF token for mutating same-origin API requests.
 * Use this instead of fetch() for POST/PUT/PATCH/DELETE to /api/*
 */
export async function fetchWithCsrf(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = (options.method || "GET").toUpperCase();
  const isMutating = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  const isSameOrigin =
    typeof window !== "undefined"
      ? url.startsWith("/api/") || url.startsWith(window.location.origin)
      : url.includes("/api/");

  if (isMutating && isSameOrigin && typeof window !== "undefined") {
    const token = await getCsrfToken();
    const headers = new Headers(options.headers);
    headers.set(CSRF_HEADER_NAME, token);
    options = { ...options, headers, credentials: "include" as RequestCredentials };
  }

  return fetch(url, options);
}
