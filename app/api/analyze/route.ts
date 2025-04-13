import { NextResponse } from "next/server";
import { join } from "path";
import { readFile } from "fs/promises";
import * as XLSX from 'xlsx';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient, SubscriptionType } from "@prisma/client";
import { Prisma } from "@prisma/client";
import OpenAI from "openai";
import { toast } from "@/hooks/use-toast";

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

// Initialize the OpenAI client with error handling
let openaiClient: OpenAI | null = null;

try {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured');
  }
  openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (error) {
  console.error('Error initializing OpenAI API:', error);
  // Continue execution - we'll handle the error in the route handler
}

export async function POST(req: Request) {
  try {
    // Check if OpenAI API is properly initialized
    if (!openaiClient) {
      console.error("OpenAI client is not initialized");
      return NextResponse.json(
        { error: "AI service is not available", ...defaultAnalysis },
        { status: 503 }
      );
    }

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

    // For PRO and LIFETIME users, don't enforce limits
    if (user.subscriptionType === SubscriptionType.PRO || user.subscriptionType === SubscriptionType.LIFETIME) {
      // Just increment the counters for tracking purposes
      await prisma.usageLimit.update({
        where: { userId: user.id },
        data: {
          analyses: {
            increment: 1
          }
        }
      });
    } else {
      // For FREE users, check and enforce limits
      const maxLimits = {
        visualizations: 1,
        analyses: 4
      };

      if (!usageLimit) {
        // Create default usage limit if it doesn't exist
        const createData = {
          user: { connect: { id: user.id } },
          visualizations: 0,
          analyses: 0,
          visualizationLimit: maxLimits.visualizations,
          analysisLimit: maxLimits.analyses,
          lastResetDate: new Date(),
          subscriptionStatus: 'active'
        };

        await prisma.usageLimit.create({
          data: createData
        });

        return NextResponse.json(
          { error: "Please try again" },
          { status: 400 }
        );
      }

      // Check if we need to reset usage counts (daily reset for free users)
      const lastReset = new Date(usageLimit.lastResetDate);
      const now = new Date();
      const shouldReset = lastReset.getDate() !== now.getDate() || lastReset.getMonth() !== now.getMonth();

      if (shouldReset) {
        await prisma.usageLimit.update({
          where: { userId: user.id },
          data: {
            visualizations: 0,
            analyses: 0,
            lastResetDate: now
          }
        });
        usageLimit.visualizations = 0;
        usageLimit.analyses = 0;
      }

      // Check if user has reached their analysis limit
      if (usageLimit.analyses >= usageLimit.analysisLimit) {
        return NextResponse.json(
          toast({
            title: "You've reached your daily analysis limit. Upgrade to PRO for unlimited analyses!",
            description: "Please try again tomorrow.",
            variant: "destructive",
          }),
          { status: 429 }
        );
      }

      // Increment analysis count for free users
      await prisma.usageLimit.update({
        where: { userId: user.id },
        data: {
          analyses: {
            increment: 1
          }
        }
      });
    }

    // Parse the request body
    const body = await req.json();
    
    // Log the body to help debug the issue
    console.log("Request body:", JSON.stringify(body, null, 2));
    
    // Handle both file path uploads and direct data submissions
    let textContent = '';
    let analysisData;
    
    if (body.filePath && body.type) {
      // Process file upload
      const { filePath, type } = body;

      if (!filePath) {
        return NextResponse.json(
          { error: "No file path provided", ...defaultAnalysis },
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
          { error: "Invalid file path", ...defaultAnalysis },
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

        // Generate AI analysis using OpenAI
        const dataToAnalyze = textContent || JSON.stringify(analysisData, null, 2);
        console.log("Analyzing data length:", dataToAnalyze.length);

        const prompt = `Analyze this data and provide insights:
        ${dataToAnalyze.substring(0, 30000)} // Limit text length for API
        
        Please provide your response in the following format:
        **1. Direct Answer:**
        [Your direct answer here]

        **2. Key Insights:**
        [Your key insights here]

        **3. Relevant Trends:**
        [Your trends analysis here]

        **4. Statistical Significance:**
        [Your statistical analysis here]`;

        console.log("Sending request to OpenAI...");
        
        // Call OpenAI's API
        const completion = await openaiClient.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a skilled data analyst that provides clear, concise, and insightful analysis." },
            { role: "user", content: prompt }
          ],
          temperature: 0.2,
          max_tokens: 1500,
        });

        // Extract text from OpenAI response
        const text = completion.choices[0].message.content || "No analysis generated";
        console.log("Analysis generated successfully");

        // Create a more complete analysis response object
        const analysisResponse = {
          insights: {
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
              question: "Please analyze this data",
              answer: text,
              timestamp: new Date().toISOString(),
            },
          },
          recommendations: [],
          chatHistory: [],
        };

        // Store in database if we have a file name
        if (body.filePath && body.type) {
          await prisma.analysis.create({
            data: {
              userId: session.user.id,
              content: text,
              fileName: body.filePath.split('/').pop() || 'unknown',
              fileType: body.type,
            }
          });
        } else if (body.fileName) {
          await prisma.analysis.create({
            data: {
              userId: session.user.id,
              content: text,
              fileName: body.fileName,
              fileType: body.fileType || "application/json",
            }
          });
        }

        return NextResponse.json({
          success: true,
          ...analysisResponse,
        });

      } catch (error) {
        console.error("Analysis error:", error);
        return NextResponse.json(
          { 
            error: error instanceof Error ? error.message : "Error analyzing data",
            ...defaultAnalysis
          },
          { status: 500 }
        );
      }
    } 
    else if (body.data) {
      // Handle direct data submission from page.tsx
      analysisData = body.data;
      
      console.log("Processing data submission. Type:", typeof body.data);
      
      // Format depends on how data is passed
      if (typeof body.data === 'string') {
        try {
          textContent = body.data;
        } catch (error) {
          console.error("Error parsing data string:", error);
          textContent = body.data;
        }
      } else {
        // Handle object data format
        textContent = JSON.stringify(body.data, null, 2);
      }
      
      console.log("Data processed, content length:", textContent.length);
    }
    // Also handle the case where 'content' is passed instead of 'data'
    else if (body.content) {
      console.log("Processing content submission");
      // Handle JSON stringified content
      if (typeof body.content === 'string') {
        try {
          const parsed = JSON.parse(body.content);
          analysisData = parsed.chartData || parsed;
          textContent = JSON.stringify(analysisData, null, 2);
        } catch (error) {
          console.error("Error parsing content string:", error);
          textContent = body.content;
        }
      } else {
        // Direct object
        analysisData = body.content.chartData || body.content;
        textContent = JSON.stringify(analysisData, null, 2);
      }
    }
    else {
      console.error("Invalid request format:", body);
      return NextResponse.json(
        { error: "Invalid request: missing filePath/type, data, or content", ...defaultAnalysis },
        { status: 400 }
      );
    }

    // Handle both formats of data
    if (!textContent && !analysisData) {
      console.error("No content to analyze");
      return NextResponse.json(
        { error: "No content to analyze", ...defaultAnalysis },
        { status: 400 }
      );
    }

    try {
      // Generate AI analysis using OpenAI
      const dataToAnalyze = textContent || JSON.stringify(analysisData, null, 2);
      console.log("Analyzing data length:", dataToAnalyze.length);

      const prompt = `Analyze this data and provide insights:
      ${dataToAnalyze.substring(0, 30000)} // Limit text length for API
      
      Please provide your response in the following format:
      **1. Direct Answer:**
      [Your direct answer here]

      **2. Key Insights:**
      [Your key insights here]

      **3. Relevant Trends:**
      [Your trends analysis here]

      **4. Statistical Significance:**
      [Your statistical analysis here]`;

      console.log("Sending request to OpenAI...");
      
      // Call OpenAI's API
      const completion = await openaiClient.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a skilled data analyst that provides clear, concise, and insightful analysis." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 1500,
      });

      // Extract text from OpenAI response
      const text = completion.choices[0].message.content || "No analysis generated";
      console.log("Analysis generated successfully");

      // Create a more complete analysis response object
      const analysisResponse = {
        insights: {
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
            question: "Please analyze this data",
            answer: text,
            timestamp: new Date().toISOString(),
          },
        },
        recommendations: [],
        chatHistory: [],
      };

      // Store in database if we have a file name
      if (body.filePath && body.type) {
        await prisma.analysis.create({
          data: {
            userId: session.user.id,
            content: text,
            fileName: body.filePath.split('/').pop() || 'unknown',
            fileType: body.type,
          }
        });
      } else if (body.fileName) {
        await prisma.analysis.create({
          data: {
            userId: session.user.id,
            content: text,
            fileName: body.fileName,
            fileType: body.fileType || "application/json",
          }
        });
      }

      return NextResponse.json({
        success: true,
        ...analysisResponse,
      });

    } catch (error) {
      console.error("Analysis error:", error);
      return NextResponse.json(
        { 
          error: error instanceof Error ? error.message : "Error analyzing data",
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