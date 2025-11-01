import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';

const FASTAPI_URL = process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://localhost:8000';

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

  // ✅ Ensure loadSession properly sets currentSession
  const loadSession = useCallback(async (sessionId: string) => {
    try {
      console.log('📂 Loading session:', sessionId);
      
      const response = await fetch(`/api/chat-sessions/${sessionId}`);
      if (!response.ok) {
        throw new Error('Failed to load session');
      }

      const data = await response.json();
      console.log('✅ Session data loaded:', data.session);
      
      // ✅ CRITICAL: Set the current session
      setCurrentSession(data.session);
      
      return data.session;
    } catch (error) {
      console.error('Error loading session:', error);
      throw error;
    }
  }, []);

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
      console.log('💾 addMessage called:', {
        sessionId,
        role,
        contentLength: content.length,
        vectorContextUsed,
        analysisType,
        hasMetadata: !!metadata
      });

      const response = await fetch(`/api/chat-sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          content,
          vectorContextUsed,
          analysisType,
          metadata
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Failed to add message:', errorData);
        throw new Error(`Failed to add message: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Message saved successfully:', data);

      // ✅ Update session's last message and message count
      await fetchSessions();

      return data.message;
    } catch (error) {
      console.error('❌ Error in addMessage:', error);
      throw error;
    }
  }, [fetchSessions]); // ✅ Fix: Add fetchSessions to dependencies

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
      console.log('🏷️ generateTitle called:', {
        sessionId,
        firstMessage: firstMessage.substring(0, 50),
        hasData,
        filename
      });

      const titleResponse = await fetch(`/api/chat-sessions/${sessionId}/generate-title`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstMessage,
          response,
          hasData,
          filename
        })
      });

      if (!titleResponse.ok) {
        const errorData = await titleResponse.json();
        console.error('❌ Failed to generate title:', errorData);
        return;
      }

      const { title } = await titleResponse.json();
      console.log('✅ Title generated:', title);

      if (!title || title.trim() === '') {
        console.warn('⚠️ Empty title received, skipping update');
        return;
      }

      // ✅ Immediately update local state for instant UI feedback
      const trimmedTitle = title.trim();
      
      setSessions((prev) => {
        const updated = prev.map((s) =>
          s.id === sessionId
            ? { ...s, title: trimmedTitle, autoTitleGenerated: true, updatedAt: new Date().toISOString() }
            : s
        );
        console.log('✅ Updated sessions state with new title:', trimmedTitle);
        return updated;
      });

      if (currentSession?.id === sessionId) {
        setCurrentSession((prev) => {
          const updated = prev ? { ...prev, title: trimmedTitle, autoTitleGenerated: true } : prev;
          console.log('✅ Updated currentSession with new title:', trimmedTitle);
          return updated;
        });
      }

      // ✅ Dispatch custom event to notify other components (like sidebar)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('chatTitleUpdated', {
          detail: { sessionId, title: trimmedTitle }
        }));
      }

      // ✅ Refresh from server after a short delay to ensure DB update is complete
      // Use a small delay to avoid race conditions with database writes
      await new Promise(resolve => setTimeout(resolve, 300));
      await fetchSessions();
      console.log('✅ Refreshed sessions from server after title update');
    } catch (error) {
      console.error('❌ Error generating title:', error);
      // Still try to refresh sessions in case title was saved despite error
      try {
        await fetchSessions();
      } catch (refreshError) {
        console.error('❌ Error refreshing sessions after title generation:', refreshError);
      }
    }
  }, [currentSession, fetchSessions]);

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
    loadSession, // ✅ Make sure this is exported
    deleteSession,
    addMessage,
    updateSessionData,
    generateTitle,
    refreshSessions: fetchSessions,
  };
}