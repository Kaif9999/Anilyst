import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';

interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messageCount: number;
  lastMessage: string | null;
  hasData: boolean;
  dataFileName: string | null;
  dataRowCount: number | null;
  autoTitleGenerated: boolean;
}

interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  vectorContextUsed: boolean;
  analysisType: string | null;
  metadata: any;
}

export function useChatSessions() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all sessions
  const fetchSessions = useCallback(async () => {
    if (!session?.user) return;

    try {
      const response = await fetch('/api/chat-sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  }, [session]);

  // Create new session
  const createSession = useCallback(async () => {
    if (!session?.user) return null;

    setIsLoading(true);
    try {
      const response = await fetch('/api/chat-sessions', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        const newSession = data.session;
        setSessions((prev) => [newSession, ...prev]);
        setCurrentSession(newSession);
        setMessages([]);
        
        toast({
          title: "✨ New Chat Created",
          description: "Start a fresh conversation",
        });

        return newSession;
      }
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: "Error",
        description: "Failed to create new chat",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [session, toast]);

  // Load session
  const loadSession = useCallback(async (sessionId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/chat-sessions/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setCurrentSession(data.session);
        setMessages(data.session.messages || []);
      }
    } catch (error) {
      console.error('Error loading session:', error);
      toast({
        title: "Error",
        description: "Failed to load chat",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Delete session
  const deleteSession = useCallback(async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat-sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        
        if (currentSession?.id === sessionId) {
          setCurrentSession(null);
          setMessages([]);
        }

        toast({
          title: "🗑️ Chat Deleted",
          description: "Chat has been removed",
        });
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      toast({
        title: "Error",
        description: "Failed to delete chat",
        variant: "destructive",
      });
    }
  }, [currentSession, toast]);

  // Add message
  const addMessage = useCallback(async (
    sessionId: string,
    role: 'user' | 'assistant',
    content: string,
    vectorContextUsed: boolean = false,
    analysisType: string | null = null,
    metadata: any = null
  ) => {
    try {
      const response = await fetch(`/api/chat-sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          content,
          vectorContextUsed,
          analysisType,
          metadata,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, data.message]);
        
        // Update session in list
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messageCount: s.messageCount + 1,
                  lastMessage: content.substring(0, 200),
                  updatedAt: new Date().toISOString(),
                }
              : s
          )
        );
      }
    } catch (error) {
      console.error('Error adding message:', error);
    }
  }, []);

  // Update session data
  const updateSessionData = useCallback(async (
    sessionId: string,
    filename: string,
    rowCount: number,
    columns: string[]
  ) => {
    try {
      const response = await fetch(`/api/chat-sessions/${sessionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hasData: true,
          dataFileName: filename,
          dataRowCount: rowCount,
          dataColumns: columns,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentSession(data.session);
        
        setSessions((prev) =>
          prev.map((s) => (s.id === sessionId ? data.session : s))
        );
      }
    } catch (error) {
      console.error('Error updating session data:', error);
    }
  }, []);

  // Generate title
  const generateTitle = useCallback(async (
    sessionId: string,
    firstMessage: string,
    response: string,
    hasData: boolean = false,
    filename: string | null = null
  ) => {
    try {
      const apiResponse = await fetch(`/api/chat-sessions/${sessionId}/generate-title`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstMessage,
          response,
          hasData,
          filename,
        }),
      });

      if (apiResponse.ok) {
        const data = await apiResponse.json();
        
        setCurrentSession((prev) =>
          prev ? { ...prev, title: data.title, autoTitleGenerated: true } : null
        );
        
        setSessions((prev) =>
          prev.map((s) =>
            s.id === sessionId
              ? { ...s, title: data.title, autoTitleGenerated: true }
              : s
          )
        );
      }
    } catch (error) {
      console.error('Error generating title:', error);
    }
  }, []);

  // Load sessions on mount
  useEffect(() => {
    if (session?.user) {
      fetchSessions();
    }
  }, [session, fetchSessions]);

  return {
    sessions,
    currentSession,
    messages,
    isLoading,
    createSession,
    loadSession,
    deleteSession,
    addMessage,
    updateSessionData,
    generateTitle,
    refreshSessions: fetchSessions,
  };
}