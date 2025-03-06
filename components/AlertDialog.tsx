import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type: 'error' | 'warning' | 'info';
  actionLabel?: string;
  onAction?: () => void;
}

import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export default function AlertDialog({
  isOpen,
  onClose,
  message,
  type,
  actionLabel,
  onAction
}: AlertDialogProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(isOpen);
  }, [isOpen]);

  const handleAction = () => {
    if (onAction) {
      onAction();
    }
    onClose();
  };

  const getTypeConfig = () => {
    switch (type) {
      case 'error':
        return {
          icon: AlertCircle,
          styles: 'bg-gradient-to-br from-red-500/10 to-red-500/5 text-red-400 border-red-500/20',
          buttonStyle: 'bg-red-500/20 hover:bg-red-500/30 text-red-400'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          styles: 'bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 text-yellow-400 border-yellow-500/20',
          buttonStyle: 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400'
        };
      case 'info':
        return {
          icon: Info,
          styles: 'bg-gradient-to-br from-blue-500/10 to-blue-500/5 text-blue-400 border-blue-500/20',
          buttonStyle: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400'
        };
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className={`relative px-8 py-6 rounded-2xl border ${getTypeConfig()?.styles} shadow-xl max-w-md w-full mx-4 backdrop-blur-xl`}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex flex-col items-center text-center space-y-5">
              {getTypeConfig()?.icon && (
                <div className="p-3 rounded-xl bg-white/10">
                  <getTypeConfig()?.icon className="w-6 h-6" />
                </div>
              )}
              <p className="text-lg font-medium leading-relaxed">{message}</p>
              <div className="flex gap-3 w-full">
                {actionLabel && (
                  <button
                    onClick={handleAction}
                    className={`flex-1 px-4 py-2.5 rounded-xl ${getTypeConfig()?.buttonStyle} transition-colors font-medium backdrop-blur-lg`}
                  >
                    {actionLabel}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white/90 font-medium backdrop-blur-lg"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
