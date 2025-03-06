// components/Popup.tsx
import React from 'react';

interface PopupProps {
  message: string;
  onClose: () => void;
}

const Popup: React.FC<PopupProps> = ({ message, onClose }) => {
  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
        onClick={onClose}
      ></div>
      
      {/* Popup */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg z-50 max-w-md w-full p-6">
        <div className="mb-4 text-center">
          <p className="text-white">{message}</p>
        </div>
        
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};

export default Popup;