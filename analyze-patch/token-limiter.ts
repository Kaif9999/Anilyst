/**
 * TOKEN LIMITER PATCH FOR ANALYZE ROUTE
 * 
 * Instructions:
 * 1. Import the helper functions from the token-helpers.ts file
 * 2. Apply token limiting to any OpenAI API calls in the analyze route
 * 3. Add the following imports at the top of your analyze/route.ts file:
 */

// Add these imports to the top of the file
import { 
  trimDataForTokenLimit, 
  ensurePromptFitsTokenLimit,
  TOKEN_LIMITS
} from "@/app/utils/token-helpers";

/**
 * For each OpenAI API call that uses a prompt with data, add the following code before the API call:
 */

// Example implementation to add before OpenAI API calls
const implementTokenLimiting = (originalPrompt: string, data: any) => {
  // Trim data to fit within token limits
  const trimmedData = trimDataForTokenLimit(data, TOKEN_LIMITS.MAX_DATA_TOKENS);
  const dataWasTrimmed = JSON.stringify(trimmedData) !== JSON.stringify(data);
  
  // Construct prompt with trimmed data
  let prompt = originalPrompt.replace(
    "{{DATA}}", 
    JSON.stringify(trimmedData, null, 2) + 
    (dataWasTrimmed ? "\n(Note: The data has been trimmed to fit within token limits)" : "")
  );
  
  // Check if the prompt is still too large and trim if necessary
  const promptResult = ensurePromptFitsTokenLimit(prompt, TOKEN_LIMITS.MAX_PROMPT_TOKENS);
  prompt = promptResult.prompt;
  
  // If prompt is still too large after trimming, throw an error
  if (promptResult.tokenCount > TOKEN_LIMITS.MAX_TOTAL_TOKENS) {
    console.error(`Prompt too large (${promptResult.tokenCount} tokens) even after trimming`);
    throw new Error(`Prompt exceeds token limit: ${promptResult.tokenCount} tokens (limit: ${TOKEN_LIMITS.MAX_TOTAL_TOKENS})`);
  }
  
  return {
    prompt,
    wasTrimmed: dataWasTrimmed || promptResult.wasTrimmed
  };
};

/**
 * EXAMPLE USAGE:
 * 
 * Replace:
 * 
 * const prompt = `Analyze this data: ${JSON.stringify(data, null, 2)}`;
 * const completion = await openaiClient.chat.completions.create({
 *   messages: [{ role: "user", content: prompt }],
 *   model: "gpt-model-name"
 * });
 * 
 * With:
 * 
 * try {
 *   const originalPrompt = `Analyze this data: {{DATA}}`;
 *   const { prompt, wasTrimmed } = implementTokenLimiting(originalPrompt, data);
 *   
 *   const completion = await openaiClient.chat.completions.create({
 *     messages: [{ role: "user", content: prompt }],
 *     model: "gpt-model-name"
 *   });
 *   
 *   // Optionally add a note about trimming in the response
 *   if (wasTrimmed) {
 *     console.log("Data was trimmed to fit within token limits");
 *   }
 * } catch (error) {
 *   if (error.message?.includes("Prompt exceeds token limit")) {
 *     return NextResponse.json(
 *       { error: "Query too complex. Please simplify your request or reduce the data size." },
 *       { status: 413 } // 413 Payload Too Large
 *     );
 *   }
 *   throw error; // Re-throw other errors
 * }
 */ 