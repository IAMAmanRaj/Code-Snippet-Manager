import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiCode, 
  FiTerminal, 
  FiStar, 
  FiCopy, 
  FiEdit2, 
  FiTrash2,
  FiClock,
  FiCalendar,
  FiEye,
  FiMonitor
} from 'react-icons/fi';
import { 
  FaWindows, 
  FaLinux, 
  FaApple 
} from 'react-icons/fa';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { Snippet } from '../types';
import { formatDate, getPrismLanguage, getPlatformLabel, copyToClipboard } from '../utils';

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
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: 'spring' as const,
      damping: 20,
      stiffness: 300,
    },
  },
};

interface SnippetViewerProps {
  snippet: Snippet;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onCopy: () => void;
}

export const SnippetViewer: React.FC<SnippetViewerProps> = ({
  snippet,
  onEdit,
  onDelete,
  onToggleFavorite,
  onCopy,
}) => {
  const getPlatformIcon = (platform: string, size: number = 16) => {
    switch (platform) {
      case 'windows':
        return <FaWindows size={size} style={{ color: 'var(--color-info)' }} />;
      case 'linux':
        return <FaLinux size={size} style={{ color: 'var(--color-warning)' }} />;
      case 'mac':
        return <FaApple size={size} style={{ color: 'var(--color-text-tertiary)' }} />;
      case 'all':
        return <FiMonitor size={size} style={{ color: 'var(--color-text-muted)' }} />;
      default:
        return null;
    }
  };

  const handleCopy = async () => {
    const success = await copyToClipboard(snippet.content);
    if (success) {
      onCopy();
    }
  };

  return (
    <motion.div 
      className="flex flex-col h-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="flex items-start justify-between gap-4 mb-6" variants={itemVariants}>
        <div className="flex items-start gap-4">
          <motion.div 
            className="p-3 rounded-xl"
            style={{
              backgroundColor: snippet.type === 'command' ? 'var(--color-success-light)' : 'var(--color-brand-light)',
              color: snippet.type === 'command' ? 'var(--color-success)' : 'var(--color-brand-primary)'
            }}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring' as const, stiffness: 400 }}
          >
            {snippet.type === 'command' ? <FiTerminal size={24} /> : <FiCode size={24} />}
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{snippet.title}</h2>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span 
                className="px-2 py-1 rounded-lg text-sm font-medium"
                style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}
              >
                {snippet.language}
              </span>
              <span 
                className="px-2 py-1 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: snippet.type === 'command' ? 'var(--color-success-light)' : 'var(--color-brand-light)',
                  color: snippet.type === 'command' ? 'var(--color-success-text)' : 'var(--color-brand-text)'
                }}
              >
                {snippet.type === 'command' ? 'Command' : 'Snippet'}
              </span>
              {snippet.type === 'snippet' && snippet.framework && snippet.framework !== 'none' && (
                <span 
                  className="px-2 py-1 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: 'var(--color-info-light)', color: 'var(--color-info-text)' }}
                >
                  {snippet.framework.charAt(0).toUpperCase() + snippet.framework.slice(1)}
                </span>
              )}
              {snippet.type === 'snippet' && snippet.category && snippet.category !== 'general' && (
                <span 
                  className="px-2 py-1 rounded-lg text-sm font-medium"
                  style={{ backgroundColor: 'var(--color-info-light)', color: 'var(--color-info-text)' }}
                >
                  {snippet.category.charAt(0).toUpperCase() + snippet.category.slice(1).replace('-', ' ')}
                </span>
              )}
              {snippet.type === 'command' && snippet.platform !== 'na' && (
                <span 
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-sm"
                  style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-tertiary)' }}
                >
                  {getPlatformIcon(snippet.platform)}
                  {getPlatformLabel(snippet.platform)}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div className="flex items-center gap-2 mb-6" variants={itemVariants}>
        <motion.button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg cursor-pointer"
          style={{ backgroundColor: 'var(--color-brand-primary)' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiCopy size={18} />
          Copy to Clipboard
        </motion.button>
        <motion.button
          onClick={onToggleFavorite}
          className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer"
          style={{
            backgroundColor: snippet.isFavorite ? 'var(--color-warning-light)' : 'var(--color-bg-tertiary)',
            color: snippet.isFavorite ? 'var(--color-warning-text)' : 'var(--color-text-secondary)'
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiStar size={18} fill={snippet.isFavorite ? 'currentColor' : 'none'} />
          {snippet.isFavorite ? 'Favorited' : 'Add to Favorites'}
        </motion.button>
        <motion.button
          onClick={onEdit}
          className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer"
          style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiEdit2 size={18} />
          Edit
        </motion.button>
        <motion.button
          onClick={() => {
            if (confirm('Are you sure you want to delete this snippet?')) {
              onDelete();
            }
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer"
          style={{ backgroundColor: 'var(--color-error-light)', color: 'var(--color-error-text)' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FiTrash2 size={18} />
          Delete
        </motion.button>
      </motion.div>

      {/* Description */}
      {snippet.description && (
        <motion.div className="mb-6" variants={itemVariants}>
          <h3 className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>Description</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>{snippet.description}</p>
        </motion.div>
      )}

      {/* Code */}
      <motion.div className="mb-6 flex-1" variants={itemVariants}>
        <h3 className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>Code</h3>
        <div className="rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border-primary)' }}>
          <SyntaxHighlighter
            language={getPrismLanguage(snippet.language)}
            style={oneDark}
            customStyle={{
              fontSize: '14px',
              margin: 0,
              maxHeight: '400px',
              overflow: 'auto',
            }}
            showLineNumbers={snippet.type === 'snippet'}
            wrapLines
            wrapLongLines
          >
            {snippet.content}
          </SyntaxHighlighter>
        </div>
      </motion.div>

      {/* Tags */}
      {snippet.tags.length > 0 && (
        <motion.div className="mb-6" variants={itemVariants}>
          <h3 className="text-sm font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-muted)' }}>Tags</h3>
          <div className="flex flex-wrap gap-2">
            {snippet.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-sm"
                style={{ backgroundColor: 'var(--color-brand-light)', color: 'var(--color-brand-text)' }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Metadata */}
      <motion.div className="border-t pt-4 mt-auto" style={{ borderColor: 'var(--color-border-primary)' }} variants={itemVariants}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
          <div className="flex items-center gap-2">
            <FiCalendar size={14} />
            <span>Created: {formatDate(snippet.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiClock size={14} />
            <span>Updated: {formatDate(snippet.updatedAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiEye size={14} />
            <span>Accessed: {snippet.accessCount} times</span>
          </div>
          {snippet.lastAccessedAt && (
            <div className="flex items-center gap-2">
              <FiClock size={14} />
              <span>Last used: {formatDate(snippet.lastAccessedAt)}</span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};