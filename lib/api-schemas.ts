/**
 * API input validation schemas.
 * Validates and sanitizes user input to prevent injection and malformed data.
 */

export function validateQuery(body: unknown): { query: string } | { error: string; status: number } {
  if (!body || typeof body !== "object" || !("query" in body)) {
    return { error: "Missing query field", status: 400 };
  }
  const q = (body as { query?: unknown }).query;
  if (typeof q !== "string") {
    return { error: "Query must be a string", status: 400 };
  }
  const trimmed = q.trim();
  if (trimmed.length < 1) {
    return { error: "Query cannot be empty", status: 400 };
  }
  if (trimmed.length > 2000) {
    return { error: "Query too long", status: 400 };
  }
  // Reject control chars and potential injection characters
  if (/[\x00-\x1f\x7f<>{}[\]\\`]/.test(trimmed)) {
    return { error: "Query contains invalid characters", status: 400 };
  }
  return { query: trimmed };
}

export function validateCreatePaymentLink(
  body: unknown
): { productId: string; billingCycle?: "monthly" | "yearly"; customerEmail?: string; redirectUrl?: string } | { error: string; status: number } {
  if (!body || typeof body !== "object" || !("productId" in body)) {
    return { error: "Missing productId", status: 400 };
  }
  const b = body as Record<string, unknown>;
  const productId = b.productId;
  if (typeof productId !== "string" || productId.length < 1 || productId.length > 100) {
    return { error: "Invalid productId", status: 400 };
  }
  let billingCycle: "monthly" | "yearly" | undefined;
  if (typeof b.billingCycle === "string") {
    if (b.billingCycle === "monthly" || b.billingCycle === "yearly") {
      billingCycle = b.billingCycle;
    }
  }
  const redirectUrl = typeof b.redirectUrl === "string" && b.redirectUrl.length > 0 ? b.redirectUrl : undefined;
  return {
    productId,
    billingCycle,
    customerEmail: typeof b.customerEmail === "string" ? b.customerEmail : undefined,
    redirectUrl,
  };
}

export function validateAnalyzeFilePath(filePath: unknown): string | { error: string } {
  if (typeof filePath !== "string" || filePath.length < 1) {
    return { error: "Invalid file path" };
  }
  const clean = filePath.replace(/^\//, "");
  if (clean.includes("..") || clean.includes("//")) {
    return { error: "Invalid file path" };
  }
  if (!clean.startsWith("uploads/")) {
    return { error: "Invalid file path" };
  }
  return clean;
}
