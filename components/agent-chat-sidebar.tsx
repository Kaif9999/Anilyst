"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  User,
  Menu,
  X,
  Trash2,
  MessageSquare,
  FileText,
  Plus,
  PanelLeftOpen,
  Search,
  Settings,
  LogOut,
  BarChart3,
} from "lucide-react";
import { useChatSessions } from "@/hooks/useChatSessions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import UserProfileModal from "./user-profile-modal";

interface AgentChatSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

function AgentChatSidebar({ isCollapsed, onToggle }: AgentChatSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sessionSearch, setSessionSearch] = useState("");
  const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [deleteModalSessionId, setDeleteModalSessionId] = useState<string | null>(null);
  const avatarDropdownRef = useRef<HTMLDivElement>(null);

  const {
    sessions,
    currentSession,
    createSession,
    loadSession,
    deleteSession,
    isLoading,
    refreshSessions,
  } = useChatSessions();

  useEffect(() => {
    const handleTitleUpdate = () => refreshSessions();
    window.addEventListener("chatTitleUpdated", handleTitleUpdate);
    return () => window.removeEventListener("chatTitleUpdated", handleTitleUpdate);
  }, [refreshSessions]);

  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        avatarDropdownRef.current &&
        !avatarDropdownRef.current.contains(e.target as Node)
      ) {
        setAvatarDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleItemClick = () => {
    if (isMobile) setIsMobileMenuOpen(false);
  };

  const handleNewChat = useCallback(async () => {
    const newSession = await createSession();
    if (newSession) {
      router.push(`/dashboard/agent?session=${newSession.id}`);
      router.refresh();
    }
    handleItemClick();
  }, [createSession, router]);

  const handleChatClick = async (sessionId: string) => {
    await loadSession(sessionId);
    router.push(`/dashboard/agent?session=${sessionId}`);
    router.refresh();
    handleItemClick();
  };

  const handleDeleteClick = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setDeleteModalSessionId(sessionId);
  };

  const handleConfirmDelete = async () => {
    if (deleteModalSessionId) {
      await deleteSession(deleteModalSessionId);
      setDeleteModalSessionId(null);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "N") {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNewChat]);

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const filteredSessions = sessions.filter((chatSession) => {
    if (!sessionSearch.trim()) return true;
    const q = sessionSearch.trim().toLowerCase();
    return (
      chatSession.title?.toLowerCase().includes(q) ||
      chatSession.lastMessage?.toLowerCase().includes(q)
    );
  });

  return (
    <>
      {isMobile && (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="fixed z-30 top-4 left-4 bg-black/40 backdrop-blur-lg hover:bg-black/60 rounded-lg p-2 shadow-xl transition-all duration-300"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>
      )}

      {isMobile && isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`${
          isMobile
            ? isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full"
            : "translate-x-0"
        } fixed inset-y-0 left-0 z-40 transition-all duration-300 ease-in-out min-h-screen flex flex-col text-white overflow-hidden ${
          isCollapsed && !isMobile
            ? "w-16 bg-[#111314]"
            : "w-[min(280px,85vw)] sm:w-[260px] bg-[#111314]"
        }`}
      >
        {/* Collapsed view - slim strip */}
        {isCollapsed && !isMobile && (
          <div className="flex flex-col items-center h-full py-4 space-y-4">
            <button
              onClick={onToggle}
              className="w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="w-5 h-5 text-gray-400" />
            </button>
            <div className="flex-1" />
            <button
              onClick={() => router.push("/signin")}
              className="w-10 h-10 rounded-full overflow-hidden hover:scale-110 transition-transform"
            >
              {status === "authenticated" && session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </button>
          </div>
        )}

        {/* Expanded view */}
        {!isCollapsed && (
          <>
            {/* Header row: collapse, logo, mode toggle */}
            <div className="flex-shrink-0 flex items-center justify-between gap-2 px-3 py-3">
              <button
                onClick={isMobile ? () => setIsMobileMenuOpen(false) : onToggle}
                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                aria-label={isMobile ? "Close" : "Collapse sidebar"}
              >
                {isMobile ? (
                  <X className="w-5 h-5 text-gray-400" />
                ) : (
                  <PanelLeftOpen className="w-5 h-5 text-gray-400" />
                )}
              </button>
              <Link
                href="/dashboard/agent"
                className="flex-1 flex items-center justify-center min-w-0"
              >
                <Image
                  src="/anilyst_logo.svg"
                  alt="Anilyst"
                  width={24}
                  height={24}
                  className="flex-shrink-0"
                />
                <span className="ml-2 text-base font-semibold text-white truncate">
                  Anilyst
                </span>
              </Link>
              <button
                onClick={() => router.push("/dashboard/visualization")}
                className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                aria-label="Switch to Visualization"
                title="Visualization"
              >
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Body: New Chat, Search, Thread list */}
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              <div className="flex-shrink-0 space-y-3 px-3 pb-3">
                <Button
                  onClick={handleNewChat}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg py-2.5 flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {isLoading ? "Creating…" : "New Chat"}
                </Button>
                {sessions.length > 0 && (
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                    <input
                      type="text"
                      placeholder="Search chats..."
                      value={sessionSearch}
                      onChange={(e) => setSessionSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-sm bg-white/5 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                      aria-label="Search chat sessions"
                    />
                  </div>
                )}
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2">
                {sessions.length === 0 ? (
                  <div className="text-center py-8 px-4">
                    <MessageSquare className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No chats yet</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Start a new conversation
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredSessions.map((chatSession) => (
                      <div
                        key={chatSession.id}
                        onClick={() => handleChatClick(chatSession.id)}
                        className={`group relative p-2 rounded-lg transition-all cursor-pointer ${
                          currentSession?.id === chatSession.id
                            ? "bg-white/10"
                            : "hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className="flex-shrink-0 mt-0.5">
                            {chatSession.hasData ? (
                              <FileText className="w-4 h-4 text-green-400" />
                            ) : (
                              <MessageSquare className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-sm font-medium text-white truncate">
                                {truncateText(chatSession.title, 25)}
                              </h4>
                              <button
                                onClick={(e) => handleDeleteClick(e, chatSession.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all text-gray-400 hover:text-red-400"
                                aria-label="Delete chat"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            {chatSession.lastMessage && (
                              <p className="text-xs text-gray-500 truncate mt-1">
                                {truncateText(chatSession.lastMessage, 35)}
                              </p>
                            )}
                            <span className="text-xs text-gray-600 mt-1 block">
                              {formatDate(chatSession.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Footer: avatar + dropdown or sign-in */}
            <div className="flex-shrink-0 mt-auto pt-4 px-3 pb-4 relative">
              {status === "loading" ? (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5 animate-pulse">
                  <div className="w-10 h-10 rounded-full bg-white/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-20 rounded bg-white/10" />
                    <div className="h-2 w-32 rounded bg-white/5" />
                  </div>
                </div>
              ) : status === "unauthenticated" ? (
                <Link
                  href="/signin"
                  className="block w-full text-center py-2.5 text-sm font-medium text-white bg-white/10 hover:bg-white/15 rounded-lg transition-colors"
                >
                  Sign in
                </Link>
              ) : (
                <div ref={avatarDropdownRef} className="relative">
                  <button
                    onClick={() => setAvatarDropdownOpen(!avatarDropdownOpen)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      {session?.user?.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name || "User"}
                          width={40}
                          height={40}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="text-sm font-medium text-white truncate">
                        {session?.user?.name || session?.user?.email?.split("@")[0] || "User"}
                      </div>
                      <div className="text-xs text-gray-400 truncate">
                        {session?.user?.email || "Free"}
                      </div>
                    </div>
                  </button>

                  {avatarDropdownOpen && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 py-2 rounded-lg bg-gray-900 shadow-xl overflow-hidden">
                      <div className="px-4 py-2 border-b border-white/10">
                        <div className="text-sm font-medium text-white truncate">
                          {session?.user?.name || session?.user?.email?.split("@")[0] || "User"}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          {session?.user?.email || ""}
                        </div>
                        <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded bg-white/10 text-gray-300">
                          Free
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setAvatarDropdownOpen(false);
                          setIsProfileModalOpen(true);
                          handleItemClick();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-left"
                      >
                        <Settings className="w-4 h-4" />
                        Profile
                      </button>
                      <button
                        onClick={async () => {
                          setAvatarDropdownOpen(false);
                          await signOut({ callbackUrl: "/", redirect: true });
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </aside>

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <Dialog open={!!deleteModalSessionId} onOpenChange={(open) => !open && setDeleteModalSessionId(null)}>
        <DialogContent className="bg-[#1a1b1e] text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Delete chat</DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this chat? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteModalSessionId(null)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function AgentChatSidebarWithSuspense(props: AgentChatSidebarProps) {
  return (
    <Suspense
      fallback={
        <aside className="fixed inset-y-0 left-0 z-40 w-16 flex items-center justify-center bg-[#111314]">
          <div className="w-10 h-10 rounded-lg bg-white/5 animate-pulse" />
        </aside>
      }
    >
      <AgentChatSidebar {...props} />
    </Suspense>
  );
}

export default AgentChatSidebarWithSuspense;
