import React from 'react';
import { motion } from 'framer-motion';
import { FiCode, FiPlus, FiDownload, FiUpload, FiSun, FiMoon } from 'react-icons/fi';

interface HeaderProps {
  onNewSnippet: () => void;
  onExport: () => void;
  onImport: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onNewSnippet, 
  onExport, 
  onImport,
  isDark,
  onToggleTheme
}) => {
  return (
    <header 
      className="px-6 py-4 sticky top-0 z-40 border-b"
      style={{ 
        backgroundColor: 'var(--color-header-bg)',
        borderColor: 'var(--color-border-primary)'
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: 'var(--color-brand-primary)' }}
          >
            <FiCode className="text-white" size={24} />
          </div>
          <div>
            <h1 
              className="text-xl font-bold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Snippet Manager
            </h1>
            <p 
              className="text-sm"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              Code snippets & commands at your fingertips
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <motion.button
            onClick={onToggleTheme}
            className="p-2 rounded-lg cursor-pointer"
            style={{ 
              backgroundColor: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-secondary)'
            }}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95, rotate: 180 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <motion.div
              key={isDark ? 'sun' : 'moon'}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isDark ? <FiSun size={20} /> : <FiMoon size={20} />}
            </motion.div>
          </motion.button>
          
          <motion.button
            onClick={onImport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer"
            style={{ 
              backgroundColor: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-secondary)'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiUpload size={18} />
            <span>Import</span>
          </motion.button>
          <motion.button
            onClick={onExport}
            className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer"
            style={{ 
              backgroundColor: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-secondary)'
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiDownload size={18} />
            <span>Export</span>
          </motion.button>
          <motion.button
            onClick={onNewSnippet}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white cursor-pointer"
            style={{ backgroundColor: 'var(--color-brand-primary)' }}
            whileHover={{ scale: 1.02, boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)' }}
            whileTap={{ scale: 0.98 }}
          >
            <FiPlus size={18} />
            <span>New Snippet</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
};