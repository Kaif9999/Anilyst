import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Plus, ChevronLeft, ChevronRight, BarChart2, FileText } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';

interface VisualizationSession {
  id: string;
  fileName: string;
  fileType: string;
  createdAt: string;
  visualizations: {
    type: string;
    title: string;
  }[];
}

interface VisualizationSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewSession: () => void;
  onSelectSession?: (session: VisualizationSession) => void;
}

export default function VisualizationSidebar({
  isOpen,
  onToggle,
  onNewSession,
  onSelectSession
}: VisualizationSidebarProps) {
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<VisualizationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch visualization sessions when component mounts
  useEffect(() => {
    fetchSessions();
  }, [session]);

  const fetchSessions = async () => {
    if (!session) return;
    
    try {
      const response = await fetch('/api/visualizations/history');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Failed to fetch visualization history:', error);
      toast({
        title: "Error",
        description: "Failed to load visualization history",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewSession = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/visualizations/history', {
        method: 'POST'
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(prevSessions => [data.session, ...prevSessions]);
        onNewSession();
        onSelectSession?.(data.session);
      } else {
        throw new Error('Failed to create new session');
      }
    } catch (error) {
      console.error('Error creating new session:', error);
      toast({
        title: "Error",
        description: "Failed to create new session",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`fixed top-1/2 ${isOpen ? 'left-[280px]' : 'left-0'} z-40 transform -translate-y-1/2 bg-white/10 backdrop-blur-lg border border-white/10 p-2 rounded-r-xl transition-all duration-300`}
      >
        {isOpen ? (
          <ChevronLeft className="w-5 h-5 text-white" />
        ) : (
          <ChevronRight className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 h-full w-[280px] bg-black/50 backdrop-blur-xl border-r border-white/10 z-30"
      >
        <div className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <History className="w-5 h-5" />
              History
            </h2>
            <button
              onClick={handleNewSession}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              title="New Visualization"
              disabled={loading}
            >
              <Plus className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Sessions List */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/30"></div>
              </div>
            ) : sessions.length > 0 ? (
              sessions.map((session) => (
                <motion.button
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => onSelectSession?.(session)}
                  className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <FileText className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-white font-medium truncate">
                        {session.fileName}
                      </h3>
                      <p className="text-sm text-white/60">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-white/40" />
                        <span className="text-sm text-white/40">
                          {session.visualizations.length} visualizations
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-white/60">
                <BarChart2 className="w-12 h-12 mb-4 opacity-40" />
                <p>No visualization history yet</p>
                <p className="text-sm mt-2">
                  Upload a file to start analyzing
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
} 