import { NextResponse } from "next/server";
import { join } from "path";
import { readFile } from "fs/promises";
import * as XLSX from 'xlsx';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { filePath, type } = await req.json();

    if (!filePath) {
      return NextResponse.json(
        { error: "No file path provided" },
        { status: 400 }
      );
    }

    // Read file
    const absolutePath = join(process.cwd(), filePath.replace(/^\//, ''));
    const fileContent = await readFile(absolutePath);

    // Process file based on type
    let textContent = '';
    let analysis = '';

    try {
      switch (type) {
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        case 'application/vnd.ms-excel':
          const workbook = XLSX.read(fileContent);
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          textContent = JSON.stringify(jsonData, null, 2);
          break;

        case 'application/pdf':
          // PDF content should be extracted on the frontend due to PDF.js browser dependency
          textContent = "PDF content will be processed on the frontend";
          break;

        case 'text/csv':
          textContent = fileContent.toString('utf-8');
          break;

        default:
          throw new Error("Unsupported file type");
      }

      // Generate AI analysis using Gemini
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `Analyze this data and provide insights:
      ${textContent.substring(0, 30000)} // Limit text length for API
      
      Please provide:
      1. Key trends and patterns
      2. Statistical analysis
      3. Notable insights
      4. Recommendations based on the data
      5. Potential visualizations that would be helpful`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      analysis = response.text();

      // Save analysis to database
      await prisma.analysis.create({
        data: {
          userId: session.user.id,
          content: analysis,
          fileName: filePath.split('/').pop(),
          fileType: type,
        }
      });

      return NextResponse.json({
        success: true,
        analysis,
      });

    } catch (error) {
      console.error("Analysis error:", error);
      return NextResponse.json(
        { error: "Error analyzing file" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Request error:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
} 