/**
 * CSRF token generation and validation utilities
 * Uses double-submit cookie pattern for stateless validation
 */

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = "csrf-token";
const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * Generate a cryptographically secure random token
 */
export function generateToken(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    const part1 = crypto.randomUUID().replace(/-/g, "");
    const part2 = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
    return part1 + part2;
  }
  // Fallback for older environments
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const randomValues = new Uint8Array(CSRF_TOKEN_LENGTH);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(randomValues);
    for (let i = 0; i < CSRF_TOKEN_LENGTH; i++) {
      result += chars[randomValues[i] % chars.length];
    }
  } else {
    for (let i = 0; i < CSRF_TOKEN_LENGTH; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }
  return result;
}

/**
 * Validate that the request has a valid CSRF token
 * Header value must match cookie value
 */
export function validateRequest(
  headerToken: string | null,
  cookieToken: string | null
): boolean {
  if (!headerToken || !cookieToken) {
    return false;
  }
  if (headerToken.length !== cookieToken.length) {
    return false;
  }
  // Constant-time comparison to prevent timing attacks
  let result = 0;
  for (let i = 0; i < headerToken.length; i++) {
    result |= headerToken.charCodeAt(i) ^ cookieToken.charCodeAt(i);
  }
  return result === 0;
}

export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME };
