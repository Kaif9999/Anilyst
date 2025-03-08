import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, History, Plus } from "lucide-react";
import { useState } from "react";

// VisualizationSidebar.tsx
interface VisualizationSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  onNewSession: () => void;
  onSelectSession: (sessionId: string) => void;
}

export default function VisualizationSidebar({
  isOpen,
  onToggle,
  onNewSession,
}: VisualizationSidebarProps) {
  const [loading, setLoading] = useState(false);


  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className={`fixed top-1/2 ${
          isOpen ? 'left-[280px] md:left-[320px]' : 'left-0'
        } z-[100] transform -translate-y-1/2 bg-white/10 backdrop-blur-lg border border-white/10 p-2 rounded-r-xl transition-all duration-300`}
      >
        {isOpen ? (
          <ChevronLeft className="w-5 h-5 text-white" />
        ) : (
          <ChevronRight className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[90]"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 h-full w-[280px] md:w-[320px] bg-black/80 backdrop-blur-xl border-r border-white/10 z-[95]"
      >
          <div className="p-4 md:p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg md:text-xl font-semibold text-white flex items-center gap-2">
                <History className="w-5 h-5" />
                History
              </h2>
              <button
                onClick={onNewSession}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                title="New Visualization"
                disabled={loading}
              >
                <Plus className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Sessions List - rest of the code remains the same */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {/* ... existing sessions list code ... */}
            </div>
          </div>
        </motion.div>
    </>
  );
}
