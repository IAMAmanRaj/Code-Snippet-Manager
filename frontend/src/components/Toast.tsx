import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiInfo, FiX } from 'react-icons/fi';
import type { Toast as ToastType } from '../hooks/useToast';

interface ToastProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

const toastVariants = {
  hidden: { 
    opacity: 0, 
    x: 100,
    scale: 0.9,
  },
  visible: { 
    opacity: 1, 
    x: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      damping: 20,
      stiffness: 300,
    },
  },
  exit: { 
    opacity: 0, 
    x: 100,
    scale: 0.9,
    transition: {
      duration: 0.2,
    },
  },
};

export const Toast: React.FC<ToastProps> = ({ toasts, onRemove }) => {
  const getStyles = (type: ToastType['type']): React.CSSProperties => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: 'rgba(22, 101, 52, 0.95)',
          borderColor: 'var(--color-success)',
        };
      case 'error':
        return {
          backgroundColor: 'rgba(153, 27, 27, 0.95)',
          borderColor: 'var(--color-error)',
        };
      default:
        return {
          backgroundColor: 'rgba(30, 41, 59, 0.95)',
          borderColor: 'var(--color-border-secondary)',
        };
    }
  };

  const getIcon = (type: ToastType['type']) => {
    switch (type) {
      case 'success':
        return <FiCheckCircle size={20} style={{ color: '#86efac' }} />;
      case 'error':
        return <FiXCircle size={20} style={{ color: '#fca5a5' }} />;
      default:
        return <FiInfo size={20} style={{ color: '#93c5fd' }} />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-white"
            style={getStyles(toast.type)}
            variants={toastVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
          >
            {getIcon(toast.type)}
            <span className="text-sm">{toast.message}</span>
            <button
              onClick={() => onRemove(toast.id)}
              className="ml-2 hover:bg-white/10 rounded p-1 transition-colors cursor-pointer"
            >
              <FiX size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};