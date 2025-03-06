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

  const getTypeStyles = () => {
    switch (type) {
      case 'error':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'warning':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'info':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
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
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`relative px-6 py-4 rounded-2xl border ${getTypeStyles()} shadow-lg max-w-md w-full mx-4 backdrop-blur-lg`}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <p className="text-lg font-medium">{message}</p>
              <div className="flex gap-3">
                {actionLabel && (
                  <button
                    onClick={handleAction}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white font-medium"
                  >
                    {actionLabel}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white/80 font-medium"
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
