import { NextResponse } from "next/server";
import { join } from "path";
import { readFile } from "fs/promises";
import * as XLSX from 'xlsx';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Default response structure
const defaultAnalysis = {
  trends: [],
  anomalies: [],
  correlations: [],
  statistics: {
    mean: 0,
    median: 0,
    mode: 0,
    outliers: [],
  },
  queryResponse: {
    question: "",
    answer: "",
    timestamp: new Date().toISOString(),
  },
};

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

    const body = await req.json();
    const { filePath, type } = body;

    if (!filePath) {
      return NextResponse.json(
        { error: "No file path provided" },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: "No file type provided" },
        { status: 400 }
      );
    }

    // Validate file path
    const cleanPath = filePath.replace(/^\//, '');
    if (!cleanPath.startsWith('uploads/')) {
      return NextResponse.json(
        { error: "Invalid file path" },
        { status: 400 }
      );
    }

    // Read file
    const absolutePath = join(process.cwd(), cleanPath);
    let fileContent;
    try {
      fileContent = await readFile(absolutePath);
    } catch (error) {
      console.error("Error reading file:", error);
      return NextResponse.json(
        { error: "File not found or inaccessible", ...defaultAnalysis },
        { status: 404 }
      );
    }

    // Process file based on type
    let textContent = '';

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
          return NextResponse.json(
            { error: "Unsupported file type", ...defaultAnalysis },
            { status: 400 }
          );
      }

      if (!textContent) {
        throw new Error("No content extracted from file");
      }

      // Generate AI analysis using Gemini
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });

      const prompt = `Analyze this data and provide insights:
      ${textContent.substring(0, 30000)} // Limit text length for API
      
      Please provide your response in the following format:
      **1. Direct Answer:**
      [Your direct answer here]

      **2. Key Insights:**
      [Your key insights here]

      **3. Relevant Trends:**
      [Your trends analysis here]

      **4. Statistical Significance:**
      [Your statistical analysis here]`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysis = response.text();

      if (!analysis) {
        throw new Error("No analysis generated");
      }

      // Save analysis to database
      await prisma.analysis.create({
        data: {
          userId: session.user.id,
          content: analysis,
          fileName: filePath.split('/').pop() || 'unknown',
          fileType: type,
        }
      });

      // Structure the response
      const analysisResponse = {
        ...defaultAnalysis,
        queryResponse: {
          question: "Please analyze this data",
          answer: analysis,
          timestamp: new Date().toISOString(),
        },
      };

      return NextResponse.json({
        success: true,
        ...analysisResponse,
      });

    } catch (error) {
      console.error("Analysis error:", error);
      return NextResponse.json(
        { 
          error: error instanceof Error ? error.message : "Error analyzing file",
          ...defaultAnalysis
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Request error:", error);
    return NextResponse.json(
      { 
        error: "Error processing request",
        ...defaultAnalysis
      },
      { status: 500 }
    );
  }
} 