import { NextResponse } from "next/server";
import { join, resolve } from "path";
import { mkdir, stat, writeFile, chmod } from "fs/promises";
import { validateFileType } from "@/lib/file-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const uploadDir = join(process.cwd(), "uploads");

async function ensureUploadDir() {
  try {
    try {
      await stat(uploadDir);
    } catch (error: unknown) {
      const err = error as { code?: string };
      if (err.code === "ENOENT") {
        await mkdir(uploadDir, { recursive: true, mode: 0o755 });
      } else {
        throw error;
      }
    }
    await chmod(uploadDir, 0o755);
  } catch (error) {
    console.error("Error setting up upload directory:", error);
    throw new Error("Failed to set up upload directory");
  }
}

const MAX_BODY_SIZE = 80 * 1024 * 1024; // 80MB (slightly above 75MB file limit)

export async function POST(req: Request) {
  try {
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: "Request body too large" },
        { status: 413 }
      );
    }

    await ensureUploadDir();

    const data = await req.formData();
    const file = data.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const maxSize = 75 * 1024 * 1024; // 75MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 75MB limit" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Magic-byte validation - prevents file type spoofing
    const validation = await validateFileType(file, buffer);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error ?? "Invalid file type" },
        { status: 400 }
      );
    }

    const timestamp = Date.now();
    const safeFileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = join(uploadDir, safeFileName);
    const resolvedPath = resolve(filePath);

    // Ensure we're within uploads dir (prevent path traversal)
    const uploadsResolved = resolve(process.cwd(), "uploads");
    if (!resolvedPath.startsWith(uploadsResolved + "/") && resolvedPath !== uploadsResolved) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
    }

    await writeFile(filePath, buffer, { mode: 0o644 });

    return NextResponse.json({
      success: true,
      filePath: `/uploads/${safeFileName}`,
      originalName: file.name,
      type: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 }
    );
  }
}
