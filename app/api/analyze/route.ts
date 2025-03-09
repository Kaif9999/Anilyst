import { NextResponse } from "next/server";
import { join } from "path";
import { readFile } from "fs/promises";
import * as XLSX from 'xlsx';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient, SubscriptionType } from "@prisma/client";
import { Prisma } from "@prisma/client";

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
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user with subscription type
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        subscriptionType: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check usage limits
    const usageLimit = await prisma.usageLimit.findUnique({
      where: { userId: user.id },
      select: {
        visualizations: true,
        analyses: true,
        visualizationLimit: true,
        analysisLimit: true,
        lastResetDate: true,
        nextBillingDate: true,
        subscriptionStatus: true
      }
    });

    // Check subscription status
    if (usageLimit?.subscriptionStatus === 'expired') {
      return NextResponse.json(
        { error: "Your subscription has expired. Please renew to continue using the service.", ...defaultAnalysis },
        { status: 402 }
      );
    }

    const maxLimits = {
      visualizations: user.subscriptionType === SubscriptionType.FREE ? 1 : 999999,
      analyses: user.subscriptionType === SubscriptionType.FREE ? 4 : 999999
    };

    if (!usageLimit) {
      // Create default usage limit if it doesn't exist
      const createData: Prisma.UsageLimitCreateInput = {
        user: { connect: { id: user.id } },
        visualizations: 0,
        analyses: 0,
        visualizationLimit: maxLimits.visualizations,
        analysisLimit: maxLimits.analyses,
        lastResetDate: new Date(),
        subscriptionStatus: user.subscriptionType === SubscriptionType.FREE ? 'active' : 'active'
      };

      await prisma.usageLimit.create({
        data: createData
      });

      return NextResponse.json(
        { error: "Please try again" },
        { status: 400 }
      );
    }

    // Check if we need to reset usage counts (daily reset for free users, monthly for paid)
    const lastReset = new Date(usageLimit.lastResetDate);
    const now = new Date();
    const shouldReset = user.subscriptionType === SubscriptionType.FREE
      ? lastReset.getDate() !== now.getDate() || lastReset.getMonth() !== now.getMonth()
      : usageLimit.nextBillingDate && now >= usageLimit.nextBillingDate;

    if (shouldReset) {
      const updateData: Prisma.UsageLimitUpdateInput = {
        visualizations: 0,
        analyses: 0,
        lastResetDate: now
      };

      await prisma.usageLimit.update({
        where: { userId: user.id },
        data: updateData
      });
      usageLimit.visualizations = 0;
      usageLimit.analyses = 0;
    }

    // Check if user has reached their analysis limit
    if (usageLimit.analyses >= usageLimit.analysisLimit) {
      const message = user.subscriptionType === SubscriptionType.FREE
        ? "You've reached your daily analysis limit. Upgrade to PRO for unlimited analyses!"
        : "You've reached your analysis limit for this billing cycle. Please contact support if you need assistance.";

      return NextResponse.json(
        { error: message, ...defaultAnalysis },
        { status: 429 }
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

      // After successful analysis, increment the usage count
      await prisma.usageLimit.update({
        where: { userId: session.user.id },
        data: {
          analyses: {
            increment: 1
          }
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