import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX } from 'react-icons/fi';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  loading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onChange, 
  placeholder = 'Search snippets and commands...',
  loading = false,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isTyping, setIsTyping] = useState(false);

  // Debounce search
  useEffect(() => {
    if (localValue !== value) {
      setIsTyping(true);
    }
    
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
      setIsTyping(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [localValue, onChange, value]);

  // Sync with external value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const showLoadingIndicator = isTyping || loading;

  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Search Icon with Animation */}
      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
        <AnimatePresence mode="wait">
          {showLoadingIndicator ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, rotate: 0 }}
              animate={{ opacity: 1, rotate: 360 }}
              exit={{ opacity: 0 }}
              transition={{ 
                rotate: { duration: 1, repeat: Infinity, ease: 'linear' },
                opacity: { duration: 0.2 },
              }}
            >
              <div 
                className="w-5 h-5 border-2 rounded-full"
                style={{ 
                  borderColor: 'var(--color-brand-light)',
                  borderTopColor: 'var(--color-brand-primary)',
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="search"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <FiSearch 
                size={20}
                style={{ color: localValue ? 'var(--color-brand-primary)' : 'var(--color-text-muted)' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-10 py-3 border rounded-xl focus:ring-2 focus:outline-none transition-all"
        style={{
          backgroundColor: 'var(--color-input-bg)',
          borderColor: localValue ? 'var(--color-brand-primary)' : 'var(--color-input-border)',
          color: 'var(--color-text-primary)',
        }}
        whileFocus={{ scale: 1.01 }}
      />

      {/* Clear button and typing indicator */}
      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
        <AnimatePresence>
          {isTyping && (
            <motion.span
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="text-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              typing...
            </motion.span>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {localValue && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => {
                setLocalValue('');
                onChange('');
              }}
              className="cursor-pointer p-1 rounded-full transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
              whileHover={{ 
                scale: 1.1,
                backgroundColor: 'var(--color-bg-hover)',
              }}
              whileTap={{ scale: 0.9 }}
            >
              <FiX size={18} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};