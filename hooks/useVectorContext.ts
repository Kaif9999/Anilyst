import { useState, useEffect } from 'react';

interface VectorContext {
  similar_analyses: Array<{
    id: string;
    score: number;
    analysis_type: string;
    key_insights: string[];
    session_id: string;
  }>;
  suggested_data_sources: string[];
  suggested_analysis_types: string[];
  has_context: boolean;
}

export function useVectorContext(query: string, sessionId: string | null) {
  const [context, setContext] = useState<VectorContext | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 20 || !sessionId) {
      setContext(null);
      return;
    }

    const getContext = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/vector/context', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query,
            session_id: sessionId
          })
        });

        if (response.ok) {
          const data = await response.json();
          setContext(data.context);
        }
      } catch (error) {
        console.error('Error fetching vector context:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the context fetch
    const timer = setTimeout(getContext, 1000);
    return () => clearTimeout(timer);
  }, [query, sessionId]);

  return { context, isLoading };
}