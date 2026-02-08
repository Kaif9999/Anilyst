/**
 * XSS sanitization utilities for user-provided content
 */

export const SAFE_URL_PREFIXES = ["https://", "http://", "mailto:", "/"];

/**
 * Check if URL is safe (prevents javascript:, data:, vbscript: etc.)
 */
export function isSafeHref(href: string): boolean {
  const trimmed = (href || "").trim().toLowerCase();
  return SAFE_URL_PREFIXES.some((prefix) => trimmed.startsWith(prefix));
}

/**
 * Sanitize href - returns safe URL or "#" for dangerous ones
 */
export function sanitizeHref(href: string): string {
  return isSafeHref(href) ? href : "#";
}
