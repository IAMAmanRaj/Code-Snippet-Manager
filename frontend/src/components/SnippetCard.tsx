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
import { formatRelativeDate, getPrismLanguage, truncateText, copyToClipboard } from '../utils';

interface SnippetCardProps {
  snippet: Snippet;
  onView: (snippet: Snippet) => void;
  onEdit: (snippet: Snippet) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onCopy: (content: string) => void;
}

export const SnippetCard: React.FC<SnippetCardProps> = ({
  snippet,
  onView,
  onEdit,
  onDelete,
  onToggleFavorite,
  onCopy,
}) => {
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'windows':
        return <FaWindows size={14} style={{ color: 'var(--color-info)' }} />;
      case 'linux':
        return <FaLinux size={14} style={{ color: '#f97316' }} />;
      case 'mac':
        return <FaApple size={14} style={{ color: 'var(--color-text-tertiary)' }} />;
      case 'all':
        return <FiMonitor size={14} style={{ color: 'var(--color-text-tertiary)' }} />;
      default:
        return null;
    }
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyToClipboard(snippet.content);
    if (success) {
      onCopy(snippet.content);
    }
  };

  // Fixed card height of 320px for uniform appearance
  const CARD_HEIGHT = 320;

  return (
    <motion.div 
      className="rounded-xl border cursor-pointer group flex flex-col overflow-hidden"
      style={{
        backgroundColor: 'var(--color-card-bg)',
        borderColor: 'var(--color-card-border)',
        height: `${CARD_HEIGHT}px`,
      }}
      onClick={() => onView(snippet)}
      whileHover={{ 
        scale: 1.02,
        boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.2)',
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {/* Header - Fixed height */}
      <div 
        className="px-4 py-3 border-b flex items-start justify-between gap-3 flex-shrink-0"
        style={{ borderColor: 'var(--color-border-primary)' }}
      >
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div 
            className="p-2 rounded-lg flex-shrink-0"
            style={{
              backgroundColor: snippet.type === 'command' 
                ? 'var(--color-command-light)' 
                : 'var(--color-brand-light)',
              color: snippet.type === 'command' 
                ? 'var(--color-command-accent)' 
                : 'var(--color-brand-primary)',
            }}
          >
            {snippet.type === 'command' ? <FiTerminal size={18} /> : <FiCode size={18} />}
          </div>
          <div className="min-w-0 flex-1">
            <h3 
              className="font-semibold truncate"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {snippet.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span 
                className="text-xs px-2 py-0.5 rounded"
                style={{
                  backgroundColor: 'var(--color-tag-bg)',
                  color: 'var(--color-tag-text)',
                }}
              >
                {snippet.language}
              </span>
              {snippet.type === 'snippet' && snippet.framework && snippet.framework !== 'none' && (
                <span 
                  className="text-xs px-2 py-0.5 rounded"
                  style={{ backgroundColor: 'var(--color-info-light)', color: 'var(--color-info-text)' }}
                >
                  {snippet.framework}
                </span>
              )}
              {snippet.type === 'snippet' && snippet.category && snippet.category !== 'general' && (
                <span 
                  className="text-xs px-2 py-0.5 rounded"
                  style={{ backgroundColor: 'var(--color-info-light)', color: 'var(--color-info-text)' }}
                >
                  {snippet.category}
                </span>
              )}
              {snippet.type === 'command' && snippet.platform !== 'na' && (
                <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                  {getPlatformIcon(snippet.platform)}
                </span>
              )}
              <span 
                className="flex items-center gap-1 text-xs"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <FiClock size={12} />
                {formatRelativeDate(snippet.createdAt)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(snippet._id);
            }}
            className="p-2 rounded-lg cursor-pointer"
            style={{
              color: snippet.isFavorite ? 'var(--color-warning)' : 'var(--color-text-muted)',
              backgroundColor: 'transparent',
            }}
            whileHover={{ 
              scale: 1.15,
              backgroundColor: snippet.isFavorite ? 'var(--color-warning-light)' : 'var(--color-bg-hover)',
              color: 'var(--color-warning)',
            }}
            whileTap={{ scale: 0.9 }}
            title={snippet.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <FiStar size={16} fill={snippet.isFavorite ? 'currentColor' : 'none'} />
          </motion.button>
          <motion.button
            onClick={handleCopy}
            className="p-2 rounded-lg cursor-pointer"
            style={{ 
              color: 'var(--color-text-muted)',
              backgroundColor: 'transparent',
            }}
            whileHover={{ 
              scale: 1.15,
              backgroundColor: 'var(--color-brand-light)',
              color: 'var(--color-brand-primary)',
            }}
            whileTap={{ scale: 0.9 }}
            title="Copy to clipboard"
          >
            <FiCopy size={16} />
          </motion.button>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(snippet);
            }}
            className="p-2 rounded-lg cursor-pointer"
            style={{ 
              color: 'var(--color-text-muted)',
              backgroundColor: 'transparent',
            }}
            whileHover={{ 
              scale: 1.15,
              backgroundColor: 'var(--color-info-light)',
              color: 'var(--color-info)',
            }}
            whileTap={{ scale: 0.9 }}
            title="Edit"
          >
            <FiEdit2 size={16} />
          </motion.button>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Are you sure you want to delete this snippet?')) {
                onDelete(snippet._id);
              }
            }}
            className="p-2 rounded-lg cursor-pointer"
            style={{ 
              color: 'var(--color-text-muted)',
              backgroundColor: 'transparent',
            }}
            whileHover={{ 
              scale: 1.15,
              backgroundColor: 'var(--color-error-light)',
              color: 'var(--color-error)',
            }}
            whileTap={{ scale: 0.9 }}
            title="Delete"
          >
            <FiTrash2 size={16} />
          </motion.button>
        </div>
      </div>

      {/* Description - Fixed height placeholder */}
      <div 
        className="px-4 py-2 border-b h-14 flex-shrink-0"
        style={{ borderColor: 'var(--color-border-primary)' }}
      >
        <p 
          className="text-sm line-clamp-2"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          {snippet.description || 'No description'}
        </p>
      </div>

      {/* Code Preview - Takes remaining space */}
      <div className="p-3 flex-1 overflow-hidden min-h-0">
        <SyntaxHighlighter
          language={getPrismLanguage(snippet.language)}
          style={oneDark}
          customStyle={{
            fontSize: '12px',
            borderRadius: '8px',
            margin: 0,
            height: '100%',
            overflow: 'hidden',
          }}
          showLineNumbers={snippet.type === 'snippet'}
        >
          {truncateText(snippet.content, 300)}
        </SyntaxHighlighter>
      </div>

      {/* Tags - Fixed height footer */}
      <div 
        className="px-4 py-2 border-t flex items-center gap-1.5 h-10 flex-shrink-0 overflow-hidden"
        style={{ borderColor: 'var(--color-border-primary)' }}
      >
        {snippet.tags.length > 0 ? (
          <>
            {snippet.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs rounded-full flex-shrink-0"
                style={{
                  backgroundColor: 'var(--color-tag-bg)',
                  color: 'var(--color-tag-text)',
                }}
              >
                #{tag}
              </span>
            ))}
            {snippet.tags.length > 4 && (
              <span 
                className="text-xs flex-shrink-0"
                style={{ color: 'var(--color-text-muted)' }}
              >
                +{snippet.tags.length - 4}
              </span>
            )}
          </>
        ) : (
          <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            No tags
          </span>
        )}
      </div>
    </motion.div>
  );
};