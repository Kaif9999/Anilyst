// Define types for chart data
export interface Dataset {
  label?: string;
  data: any[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  [key: string]: any; // Allow for additional properties
}

// Function to estimate token count - crude approximation based on text length
// OpenAI tokens are roughly 4 characters per token
export const estimateTokenCount = (text: string): number => {
  return Math.ceil(text.length / 4);
};

// Function to trim data to fit within token limits
export const trimDataForTokenLimit = (data: any, maxTokens: number = 100000): any => {
  let jsonData = JSON.stringify(data, null, 2);
  let estimatedTokens = estimateTokenCount(jsonData);
  
  if (estimatedTokens <= maxTokens) {
    return data; // No trimming needed
  }
  
  console.log(`Data exceeds token limit: ${estimatedTokens} tokens (limit: ${maxTokens})`);
  
  // If it's an array, reduce the number of items
  if (Array.isArray(data)) {
    const reductionFactor = maxTokens / estimatedTokens;
    const newLength = Math.max(1, Math.floor(data.length * reductionFactor));
    console.log(`Trimming array from ${data.length} to ${newLength} items`);
    return data.slice(0, newLength);
  }
  
  // If it's an object with datasets, trim the datasets
  if (data && data.datasets && Array.isArray(data.datasets)) {
    const trimmedData = { ...data };
    
    // Limit number of datasets
    if (trimmedData.datasets.length > 3) {
      console.log(`Trimming datasets from ${trimmedData.datasets.length} to 3`);
      trimmedData.datasets = trimmedData.datasets.slice(0, 3);
    }
    
    // For each dataset, limit the number of data points
    trimmedData.datasets = trimmedData.datasets.map((dataset: Dataset) => {
      if (dataset.data && Array.isArray(dataset.data) && dataset.data.length > 100) {
        console.log(`Trimming dataset from ${dataset.data.length} to 100 data points`);
        return {
          ...dataset,
          data: dataset.data.slice(0, 100),
          _trimmed: true,
          _originalLength: dataset.data.length
        };
      }
      return dataset;
    });
    
    return trimmedData;
  }
  
  // For other objects, try to trim deeply nested structures
  if (typeof data === 'object' && data !== null) {
    const trimmedData: any = {};
    const keysToKeep = Object.keys(data).slice(0, 20); // Keep only first 20 keys
    
    for (const key of keysToKeep) {
      if (typeof data[key] === 'object' && data[key] !== null) {
        if (estimateTokenCount(JSON.stringify(data[key])) > maxTokens / 2) {
          // This nested object is too large, provide a summary instead
          trimmedData[key] = { _trimmed: true, _summary: `Original ${key} was too large (${estimateTokenCount(JSON.stringify(data[key]))} tokens)` };
        } else {
          trimmedData[key] = data[key];
        }
      } else {
        trimmedData[key] = data[key];
      }
    }
    
    if (Object.keys(data).length > 20) {
      trimmedData._trimmed = true;
      trimmedData._keptKeys = keysToKeep.length;
      trimmedData._totalKeys = Object.keys(data).length;
    }
    
    return trimmedData;
  }
  
  return data;
};

// Constants for token limits
export const TOKEN_LIMITS = {
  MAX_TOTAL_TOKENS: 120000,
  MAX_CONTEXT_TOKENS: 30000,
  MAX_DATA_TOKENS: 80000,
  MAX_PROMPT_TOKENS: 110000,
};

// Function to check if a prompt is too large and trim it if necessary
export const ensurePromptFitsTokenLimit = (
  prompt: string,
  maxTokens: number = TOKEN_LIMITS.MAX_PROMPT_TOKENS
): { prompt: string; wasTrimmed: boolean; tokenCount: number } => {
  const tokenCount = estimateTokenCount(prompt);
  
  if (tokenCount <= maxTokens) {
    return { prompt, wasTrimmed: false, tokenCount };
  }
  
  console.log(`Prompt exceeds token limit: ${tokenCount} tokens (limit: ${maxTokens})`);
  
  // Simple trimming strategy: truncate and add a note
  const truncationPoint = Math.floor((prompt.length * maxTokens) / tokenCount);
  const trimmedPrompt = prompt.substring(0, truncationPoint) + 
    "\n\n[Note: The prompt was truncated to fit within token limits. Some data may be missing.]";
  
  return { 
    prompt: trimmedPrompt, 
    wasTrimmed: true,
    tokenCount: estimateTokenCount(trimmedPrompt)
  };
}; 