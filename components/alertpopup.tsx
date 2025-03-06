// components/alertpopup.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AlertPopupProps {
  show: boolean;
  message: string;
}

const AlertPopup: React.FC<AlertPopupProps> = ({ show, message }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-xl px-6 py-3 shadow-lg">
            <p className="text-white text-sm md:text-base">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlertPopup;
