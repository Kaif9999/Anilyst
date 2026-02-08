/**
 * File validation with magic-byte (binary signature) checks.
 * Prevents file type spoofing - file.type and extension can be faked.
 */

export const ALLOWED_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls
  "application/pdf",
  "text/csv",
] as const;

export const ALLOWED_EXTENSIONS = ["xlsx", "xls", "pdf", "csv"] as const;

// Magic bytes for allowed binary formats (first few bytes identify file type)
const MAGIC_SIGNATURES: Array<{ offset: number; bytes: number[]; mime: string; ext: string }> = [
  { offset: 0, bytes: [0x25, 0x50, 0x44, 0x46], mime: "application/pdf", ext: "pdf" }, // %PDF
  { offset: 0, bytes: [0x50, 0x4b, 0x03, 0x04], mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ext: "xlsx" }, // PK.. (ZIP/XLSX)
  { offset: 0, bytes: [0x50, 0x4b, 0x05, 0x06], mime: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ext: "xlsx" }, // PK.. (ZIP empty)
  { offset: 0, bytes: [0xd0, 0xcf, 0x11, 0xe0], mime: "application/vnd.ms-excel", ext: "xls" }, // OLE (XLS)
];

// Dangerous signatures - reject if found (executables, etc.)
const REJECT_SIGNATURES: Array<{ offset: number; bytes: number[] }> = [
  { offset: 0, bytes: [0x4d, 0x5a] }, // MZ - Windows executable
  { offset: 0, bytes: [0x7f, 0x45, 0x4c, 0x46] }, // ELF - Unix executable
  { offset: 0, bytes: [0x23, 0x21] }, // #! - shebang scripts
];

function hasSignature(buffer: Buffer, sig: { offset: number; bytes: number[] }): boolean {
  if (buffer.length < sig.offset + sig.bytes.length) return false;
  return sig.bytes.every((b, i) => buffer[sig.offset + i] === b);
}

/**
 * Validate file using magic bytes. Prevents spoofing (e.g. .exe renamed to .csv).
 * For CSV (text): extension must match, content must not be binary.
 */
export async function validateFileType(
  file: File,
  buffer: Buffer
): Promise<{ valid: boolean; error?: string }> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const parts = file.name.split(".");

  // Reject double extensions (e.g. file.csv.exe)
  if (parts.length > 2) {
    const suspected = parts.slice(-2).join(".");
    if (["csv.exe", "xlsx.exe", "pdf.exe", "xls.exe"].includes(suspected.toLowerCase())) {
      return { valid: false, error: "Invalid file: double extension detected" };
    }
  }

  if (!ALLOWED_EXTENSIONS.includes(ext as any)) {
    return { valid: false, error: "Invalid file type. Only Excel, PDF, and CSV files are allowed" };
  }

  // Reject dangerous signatures
  for (const sig of REJECT_SIGNATURES) {
    if (hasSignature(buffer, sig)) {
      return { valid: false, error: "Invalid file: executable or script not allowed" };
    }
  }

  // For binary formats: verify magic bytes match claimed type
  if (ext === "pdf" || ext === "xlsx" || ext === "xls") {
    const matching = MAGIC_SIGNATURES.find((s) => s.ext === ext && hasSignature(buffer, s));
    if (!matching) {
      return {
        valid: false,
        error: `File content does not match ${ext.toUpperCase()} format. The file may be corrupted or disguised.`,
      };
    }
  }

  // For CSV: text format, no magic bytes. Ensure it's not binary (no null bytes in first 1KB)
  if (ext === "csv") {
    const sample = buffer.subarray(0, Math.min(1024, buffer.length));
    if (sample.some((b) => b === 0)) {
      return { valid: false, error: "Invalid CSV: file appears to be binary" };
    }
  }

  return { valid: true };
}
