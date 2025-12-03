import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  color: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, color }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-gray-900 border-2 rounded-xl shadow-2xl overflow-hidden flex flex-col"
        style={{ borderColor: color, boxShadow: `0 0 20px ${color}40` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800" style={{ backgroundColor: `${color}10` }}>
          <h2 className="text-2xl font-bold tracking-wider text-white uppercase font-mono">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar text-gray-100">
          {children}
        </div>

        {/* Footer Hint */}
        <div className="p-4 bg-gray-950 border-t border-gray-800 text-center text-xs text-gray-500 font-mono">
          PRESS [ESC] OR CLICK X TO CLOSE
        </div>
      </div>
    </div>
  );
};

export default Modal;