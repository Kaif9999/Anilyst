import { NextResponse } from "next/server";
import { join } from "path";
import { mkdir, stat, writeFile, chmod } from "fs/promises";

// New configuration format for Next.js App Router
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const uploadDir = join(process.cwd(), "uploads");

// Ensure upload directory exists with proper permissions
async function ensureUploadDir() {
  try {
    try {
      await stat(uploadDir);
    } catch (error: any) {
      if (error.code === "ENOENT") {
        await mkdir(uploadDir, { recursive: true, mode: 0o755 });
      } else {
        throw error;
      }
    }
    
    // Ensure proper permissions
    await chmod(uploadDir, 0o755);
  } catch (error) {
    console.error("Error setting up upload directory:", error);
    throw new Error("Failed to set up upload directory");
  }
}

export async function POST(req: Request) {
  try {
    await ensureUploadDir();

    const data = await req.formData();
    const file = data.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Validate file size (75MB limit)
    const maxSize = 75 * 1024 * 1024; // 75MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 75MB limit" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/pdf', // .pdf
      'text/csv', // .csv
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only Excel, PDF, and CSV files are allowed" },
        { status: 400 }
      );
    }

    try {
      // Convert file to buffer for processing
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Generate a safe filename
      const timestamp = Date.now();
      const safeFileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filePath = join(uploadDir, safeFileName);

      // Save file with proper permissions
      await writeFile(filePath, buffer, { mode: 0o644 });
      
      return NextResponse.json({
        success: true,
        filePath: `/uploads/${safeFileName}`,
        originalName: file.name,
        type: file.type,
      });
    } catch (error) {
      console.error("Error processing file:", error);
      return NextResponse.json(
        { error: "Error processing file" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 }
    );
  }
} 