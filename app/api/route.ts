import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || "r8_PrDdYhzuWnS3etWE1eBcIPXkWWhuycy3KboLs",
});

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  const question = formData.get('question') as string;

  if (!file || !question) {
    return NextResponse.json({ error: 'File and question are required' }, { status: 400 });
  }

  const csvData = await file.text();
  const parsedData = Papa.parse(csvData, { header: true }).data;

  const input = `
    CSV Data:
    ${JSON.stringify(parsedData, null, 2)}

    Question: ${question}

    Please analyze the CSV data and answer the question. If appropriate, suggest a chart type to visualize the data.
  `;

  try {
    const output = await replicate.run(
      "meta/llama-2-7b-chat:8e6975e5ed6174911a6ff3d60540dfd4844201974602551e10e9e87ab143d81e",
      {
        input: {
          prompt: input
        }
      }
    );
    console.log(output);

    return NextResponse.json({ result: output, csvData: parsedData });
  } catch (error) {
    console.error('Error calling Replicate API:', error);
    return NextResponse.json({ error: 'Failed to process the request' }, { status: 500 });
  }
}

