import { NextResponse } from "next/server";
import formidable from "formidable";
import { join } from "path";
import { mkdir, stat, writeFile } from "fs/promises";

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = join(process.cwd(), "uploads");

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await stat(uploadDir);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      await mkdir(uploadDir, { recursive: true });
    } else {
      throw error;
    }
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

    // Convert file to buffer for processing
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = join(uploadDir, fileName);

    // Process file and return data
    let processedData;
    try {
      // File processing logic will be handled by the frontend
      // We just need to save the file and return its path
      await writeFile(filePath, buffer);
      
      return NextResponse.json({
        success: true,
        filePath: `/uploads/${fileName}`,
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