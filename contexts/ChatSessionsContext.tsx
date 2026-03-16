"use client";

import { createContext, useContext } from "react";
import { useChatSessions } from "@/hooks/useChatSessions";

type ChatSessionsValue = ReturnType<typeof useChatSessions>;

const ChatSessionsContext = createContext<ChatSessionsValue | null>(null);

export function ChatSessionsProvider({ children }: { children: React.ReactNode }) {
  const value = useChatSessions();
  return (
    <ChatSessionsContext.Provider value={value}>
      {children}
    </ChatSessionsContext.Provider>
  );
}

export function useChatSessionsContext(): ChatSessionsValue {
  const ctx = useContext(ChatSessionsContext);
  if (!ctx) {
    throw new Error("useChatSessionsContext must be used within ChatSessionsProvider");
  }
  return ctx;
}
