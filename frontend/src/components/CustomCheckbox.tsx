import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiStar } from 'react-icons/fi';

interface CustomCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  variant?: 'default' | 'favorite';
  disabled?: boolean;
}

export const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  checked,
  onChange,
  label,
  description,
  variant = 'default',
  disabled = false,
}) => {
  const isFavorite = variant === 'favorite';

  return (
    <motion.label 
      className="flex items-start gap-3 cursor-pointer select-none"
      style={{ opacity: disabled ? 0.6 : 1 }}
      whileHover={!disabled ? { scale: 1.01 } : {}}
      whileTap={!disabled ? { scale: 0.99 } : {}}
    >
      <motion.div
        className="relative flex items-center justify-center w-6 h-6 rounded-lg border-2 flex-shrink-0 mt-0.5"
        style={{
          backgroundColor: checked 
            ? isFavorite ? 'var(--color-warning)' : 'var(--color-brand-primary)'
            : 'var(--color-input-bg)',
          borderColor: checked 
            ? isFavorite ? 'var(--color-warning)' : 'var(--color-brand-primary)'
            : 'var(--color-input-border)',
        }}
        whileHover={!disabled ? {
          borderColor: isFavorite ? 'var(--color-warning)' : 'var(--color-brand-primary)',
          scale: 1.05,
        } : {}}
        whileTap={!disabled ? { scale: 0.9 } : {}}
        onClick={() => !disabled && onChange(!checked)}
      >
        <AnimatePresence>
          {checked && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring' as const, stiffness: 500, damping: 20 }}
            >
              {isFavorite ? (
                <FiStar size={14} fill="white" color="white" />
              ) : (
                <FiCheck size={14} color="white" strokeWidth={3} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {(label || description) && (
        <div className="flex-1" onClick={() => !disabled && onChange(!checked)}>
          {label && (
            <span 
              className="text-sm font-medium block"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {label}
            </span>
          )}
          {description && (
            <span 
              className="text-xs block mt-0.5"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {description}
            </span>
          )}
        </div>
      )}
      
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        className="sr-only"
        disabled={disabled}
      />
    </motion.label>
  );
};