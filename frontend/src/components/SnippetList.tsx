import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiInbox, FiSearch } from 'react-icons/fi';
import { SnippetCard } from './SnippetCard';
import type { Snippet } from '../types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring' as const,
      damping: 20,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
};

const emptyStateVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: 'spring' as const,
      damping: 20,
      stiffness: 300,
    },
  },
};

const shimmerVariants = {
  initial: { x: '-100%' },
  animate: { 
    x: '100%',
    transition: {
      repeat: Infinity,
      duration: 1.5,
      ease: 'linear' as const,
    },
  },
};

// Skeleton Card Component
const SkeletonCard: React.FC<{ delay?: number }> = ({ delay = 0 }) => (
  <motion.div 
    className="rounded-xl border overflow-hidden flex flex-col"
    style={{
      backgroundColor: 'var(--color-card-bg)',
      borderColor: 'var(--color-card-border)',
      height: '320px',
    }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1, duration: 0.3 }}
  >
    {/* Header Skeleton */}
    <div 
      className="px-4 py-3 border-b flex items-start gap-3"
      style={{ borderColor: 'var(--color-border-primary)' }}
    >
      <div 
        className="w-10 h-10 rounded-lg relative overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
      >
        <motion.div 
          className="absolute inset-0"
          style={{ 
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          }}
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
        />
      </div>
      <div className="flex-1">
        <div 
          className="h-5 rounded w-3/4 mb-2 relative overflow-hidden"
          style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
        >
          <motion.div 
            className="absolute inset-0"
            style={{ 
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            }}
            variants={shimmerVariants}
            initial="initial"
            animate="animate"
          />
        </div>
        <div className="flex gap-2">
          <div 
            className="h-4 rounded w-16 relative overflow-hidden"
            style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
          >
            <motion.div 
              className="absolute inset-0"
              style={{ 
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
              }}
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
            />
          </div>
          <div 
            className="h-4 rounded w-20 relative overflow-hidden"
            style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
          >
            <motion.div 
              className="absolute inset-0"
              style={{ 
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
              }}
              variants={shimmerVariants}
              initial="initial"
              animate="animate"
            />
          </div>
        </div>
      </div>
    </div>

    {/* Description Skeleton */}
    <div 
      className="px-4 py-2 border-b h-14"
      style={{ borderColor: 'var(--color-border-primary)' }}
    >
      <div 
        className="h-4 rounded w-full mb-1 relative overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
      >
        <motion.div 
          className="absolute inset-0"
          style={{ 
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          }}
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
        />
      </div>
      <div 
        className="h-4 rounded w-2/3 relative overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
      >
        <motion.div 
          className="absolute inset-0"
          style={{ 
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
          }}
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
        />
      </div>
    </div>

    {/* Code Preview Skeleton */}
    <div className="p-3 flex-1">
      <div 
        className="h-full rounded-lg relative overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
      >
        <motion.div 
          className="absolute inset-0"
          style={{ 
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
          }}
          variants={shimmerVariants}
          initial="initial"
          animate="animate"
        />
      </div>
    </div>

    {/* Tags Skeleton */}
    <div 
      className="px-4 py-2 border-t flex items-center gap-2 h-10"
      style={{ borderColor: 'var(--color-border-primary)' }}
    >
      {[1, 2, 3].map((i) => (
        <div 
          key={i}
          className="h-5 rounded-full w-14 relative overflow-hidden"
          style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
        >
          <motion.div 
            className="absolute inset-0"
            style={{ 
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
            }}
            variants={shimmerVariants}
            initial="initial"
            animate="animate"
          />
        </div>
      ))}
    </div>
  </motion.div>
);

// Searching State Component
const SearchingState: React.FC = () => (
  <motion.div 
    className="flex flex-col items-center justify-center py-16 text-center"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div 
      className="p-4 rounded-full mb-4"
      style={{ backgroundColor: 'var(--color-brand-light)' }}
      animate={{ 
        scale: [1, 1.1, 1],
        rotate: [0, 10, -10, 0],
      }}
      transition={{ 
        duration: 1.5, 
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <FiSearch size={48} style={{ color: 'var(--color-brand-primary)' }} />
    </motion.div>
    <motion.h3 
      className="text-xl font-semibold mb-2"
      style={{ color: 'var(--color-text-secondary)' }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      Searching...
    </motion.h3>
    <p style={{ color: 'var(--color-text-tertiary)' }}>
      Looking for matching snippets and commands
    </p>
  </motion.div>
);

interface SnippetListProps {
  snippets: Snippet[];
  loading: boolean;
  searching?: boolean;
  onView: (snippet: Snippet) => void;
  onEdit: (snippet: Snippet) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onCopy: (content: string) => void;
}

export const SnippetList: React.FC<SnippetListProps> = ({
  snippets,
  loading,
  searching = false,
  onView,
  onEdit,
  onDelete,
  onToggleFavorite,
  onCopy,
}) => {
  // Show searching state
  if (searching) {
    return <SearchingState />;
  }

  // Show loading skeleton
  if (loading) {
    return (
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {[...Array(6)].map((_, i) => (
          <SkeletonCard key={i} delay={i} />
        ))}
      </motion.div>
    );
  }

  if (snippets.length === 0) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center py-16 text-center"
        variants={emptyStateVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="p-4 rounded-full mb-4"
          style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
          animate={{ 
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <FiInbox size={48} style={{ color: 'var(--color-text-muted)' }} />
        </motion.div>
        <h3 
          className="text-xl font-semibold mb-2"
          style={{ color: 'var(--color-text-secondary)' }}
        >
          No snippets found
        </h3>
        <p 
          className="max-w-md"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          Get started by creating your first code snippet or command. Use the "New Snippet" button above.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="popLayout">
        {snippets.map((snippet) => (
          <motion.div
            key={snippet._id}
            variants={itemVariants}
            exit="exit"
            layout
          >
            <SnippetCard
              snippet={snippet}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleFavorite={onToggleFavorite}
              onCopy={onCopy}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};