import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

const contentVariants = {
  hidden: { scale: 0.95, opacity: 0, y: 10 },
  visible: { 
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { 
      type: "spring",
      damping: 25,
      stiffness: 400,
      duration: 0.3
    }
  },
  exit: { 
    scale: 0.95,
    opacity: 0,
    y: 10,
    transition: { duration: 0.2 }
  }
};

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

  const getTypeConfig = () => {
    switch (type) {
      case 'error':
        return {
          icon: AlertCircle,
          styles: 'bg-gradient-to-br from-red-500/10 to-red-500/5 text-red-400 border-red-500/20 shadow-red-500/10 dark:from-red-500/20',
          buttonStyle: 'bg-red-500/20 hover:bg-red-500/30 text-red-400 shadow-red-500/20 dark:bg-red-500/30'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          styles: 'bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 text-yellow-400 border-yellow-500/20 shadow-yellow-500/10 dark:from-yellow-500/20',
          buttonStyle: 'bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 shadow-yellow-500/20 dark:bg-yellow-500/30'
        };
      case 'info':
        return {
          icon: Info,
          styles: 'bg-gradient-to-br from-blue-500/10 to-blue-500/5 text-blue-400 border-blue-500/20 shadow-blue-500/10 dark:from-blue-500/20',
          buttonStyle: 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 shadow-blue-500/20 dark:bg-blue-500/30'
        };
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center" 
          role="dialog"
          aria-modal="true"
          aria-labelledby="alert-title"
        >
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 bg-black/60 backdrop-blur-[2px] dark:bg-black/80"
            onClick={onClose}
          />
          <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`relative px-8 py-6 rounded-2xl border ${getTypeConfig()?.styles} shadow-lg ring-1 ring-white/10 max-w-md w-full mx-4 backdrop-blur-xl`}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/20"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex flex-col items-center text-center space-y-5">
              {getTypeConfig()?.icon && (
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="p-3 rounded-xl bg-white/10 ring-1 ring-white/20 dark:bg-white/5"
                  role="img"
                  aria-hidden="true">
                  <getTypeConfig()?.icon className="w-6 h-6" />
                </motion.div>
              )}
              <motion.p 
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                id="alert-title"
                className="text-lg font-medium leading-relaxed tracking-tight">
                {message}
              </motion.p>
              <div className="flex gap-3 w-full">
                {actionLabel && (
                  <button
                    onClick={handleAction}
                    className={`flex-1 px-4 py-2.5 rounded-xl ${getTypeConfig()?.buttonStyle} transition-all font-medium backdrop-blur-lg hover:scale-[1.02] active:scale-[0.98] shadow-lg focus:outline-none focus:ring-2 focus:ring-white/20`}
                  >
                    {actionLabel}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all text-white/90 font-medium backdrop-blur-lg hover:scale-[1.02] active:scale-[0.98] shadow-lg focus:outline-none focus:ring-2 focus:ring-white/20"
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
