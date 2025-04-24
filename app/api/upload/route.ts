import { NextResponse } from "next/server";
import { join } from "path";
import { mkdir, stat, writeFile, chmod } from "fs/promises";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const uploadDir = join(process.cwd(), "uploads");
const isProd = process.env.NODE_ENV === 'production';

async function ensureUploadDir() {
  if (isProd) return;
  
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

// Process file without saving to disk (for production)
async function processFileInMemory(file: File) {
  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
    
    // Store basic metadata
    const fileData = {
      id: `in-memory-${timestamp}`,
      originalName: file.name,
      type: file.type,
      size: file.size,
      timestamp
    };
    
    return {
      success: true,
      filePath: `memory://${fileData.id}`,
      originalName: file.name,
      type: file.type,
      metadata: fileData
    };
  } catch (error) {
    console.error("Error processing file in memory:", error);
    throw new Error("Failed to process file");
  }
}

export async function POST(req: Request) {
  try {
    // Only ensure upload directory in dev mode
    if (!isProd) {
      await ensureUploadDir();
    }

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

    // Check file extension as a fallback
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowedExts = ['xlsx', 'xls', 'pdf', 'csv'];
    
    const isValidType = allowedTypes.includes(file.type) || (fileExt && allowedExts.includes(fileExt));
    
    if (!isValidType) {
      return NextResponse.json(
        { error: "Invalid file type. Only Excel, PDF, and CSV files are allowed" },
        { status: 400 }
      );
    }

    try {
      // In production, process file in memory
      if (isProd) {
        const result = await processFileInMemory(file);
        return NextResponse.json(result);
      }
      
      // In development, save to file system
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