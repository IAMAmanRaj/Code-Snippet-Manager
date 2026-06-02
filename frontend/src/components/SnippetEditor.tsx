import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Editor from '@monaco-editor/react';
import type { OnMount } from '@monaco-editor/react';
import { FiSave, FiX, FiPlus, FiCode, FiTerminal, FiAlignLeft, FiAlertCircle, FiInfo } from 'react-icons/fi';
import type { Snippet, SnippetFormData, Platform, Category, Framework } from '../types';
import { LANGUAGES, getMonacoLanguage } from '../utils';
import { CustomSelect } from './CustomSelect';
import { CustomCheckbox } from './CustomCheckbox';
import type { editor } from 'monaco-editor';

// Patterns that indicate code vs command
const CODE_PATTERNS = [
  /^(import|export|from|const|let|var|function|class|interface|type|enum)\s/m,
  /^\s*(if|else|for|while|switch|try|catch)\s*\(/m,
  /=>/,
  /\{\s*\n/,
  /;\s*$/m,
  /<[A-Z][a-zA-Z]*[\s/>]/,
  /^\s*\/\//m,
  /^\s*\/\*/m,
  /^\s*#include/m,
  /^\s*def\s+\w+\s*\(/m,
  /^\s*class\s+\w+/m,
];

// Patterns that indicate shell commands
const COMMAND_PATTERNS = [
  /^\s*(npm|npx|yarn|pnpm|bun)\s/m,
  /^\s*(git|gh)\s/m,
  /^\s*(docker|docker-compose|kubectl)\s/m,
  /^\s*(ls|cd|pwd|mkdir|rm|cp|mv|cat|grep|find|chmod|chown)\s/m,
  /^\s*(curl|wget|ssh|scp)\s/m,
  /^\s*(apt|apt-get|yum|brew|pip|gem)\s/m,
  /^\s*(echo|printf|export|source|alias)\s/m,
  /^\s*(ps|kill|top|htop|df|du)\s/m,
  /^\s*(sudo|su)\s/m,
  /^\s*\.\//,
  /\s\|\s/,
  /\s&&\s/,
  /\s>\s/,
  /\s>>\s/,
];

// Check if content looks like code (not a command)
const looksLikeCode = (content: string): boolean => {
  const trimmedContent = content.trim();
  
  // Too many lines usually indicates code
  const lineCount = trimmedContent.split('\n').length;
  if (lineCount > 5) return true;
  
  // Check for code patterns
  for (const pattern of CODE_PATTERNS) {
    if (pattern.test(trimmedContent)) return true;
  }
  
  return false;
};

// Check if content looks like a command
const looksLikeCommand = (content: string): boolean => {
  const trimmedContent = content.trim();
  
  // Commands are typically single or few lines
  const lineCount = trimmedContent.split('\n').length;
  if (lineCount > 10) return false;
  
  // Check for command patterns
  for (const pattern of COMMAND_PATTERNS) {
    if (pattern.test(trimmedContent)) return true;
  }
  
  return false;
};

// Category options
const CATEGORIES: { value: Category; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'component', label: 'Component' },
  { value: 'hook', label: 'Hook' },
  { value: 'utility', label: 'Utility' },
  { value: 'api', label: 'API' },
  { value: 'style', label: 'Style/CSS' },
  { value: 'config', label: 'Config' },
  { value: 'test', label: 'Test' },
  { value: 'type', label: 'Type/Interface' },
  { value: 'context', label: 'Context' },
  { value: 'redux', label: 'Redux/State' },
  { value: 'form', label: 'Form' },
  { value: 'animation', label: 'Animation' },
  { value: 'layout', label: 'Layout' },
  { value: 'navigation', label: 'Navigation' },
  { value: 'auth', label: 'Authentication' },
  { value: 'data-fetching', label: 'Data Fetching' },
  { value: 'error-handling', label: 'Error Handling' },
  { value: 'performance', label: 'Performance' },
  { value: 'accessibility', label: 'Accessibility' },
  { value: 'other', label: 'Other' },
];

// Framework options
const FRAMEWORKS: { value: Framework; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'react', label: 'React' },
  { value: 'nextjs', label: 'Next.js' },
  { value: 'vue', label: 'Vue.js' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'express', label: 'Express' },
  { value: 'nestjs', label: 'NestJS' },
  { value: 'fastapi', label: 'FastAPI' },
  { value: 'django', label: 'Django' },
  { value: 'flask', label: 'Flask' },
  { value: 'spring', label: 'Spring' },
  { value: 'other', label: 'Other' },
];

// Platform options
const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'all', label: 'All Platforms' },
  { value: 'windows', label: 'Windows' },
  { value: 'linux', label: 'Linux' },
  { value: 'mac', label: 'macOS' },
];

// Language options for select
const LANGUAGE_OPTIONS = LANGUAGES.map(lang => ({ value: lang, label: lang }));

interface SnippetEditorProps {
  snippet?: Snippet | null;
  onSave: (data: SnippetFormData) => Promise<void>;
  onCancel: () => void;
  existingTags: string[];
}

export const SnippetEditor: React.FC<SnippetEditorProps> = ({
  snippet,
  onSave,
  onCancel,
  existingTags,
}) => {
  const [formData, setFormData] = useState<SnippetFormData>({
    title: '',
    content: '',
    description: '',
    type: 'snippet',
    language: 'javascript',
    category: 'general',
    framework: 'none',
    platform: 'na',
    tags: [],
    isFavorite: false,
  });
  const [tagInput, setTagInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };

  const handleFormatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  useEffect(() => {
    if (snippet) {
      setFormData({
        title: snippet.title,
        content: snippet.content,
        description: snippet.description,
        type: snippet.type,
        language: snippet.language,
        category: snippet.category || 'general',
        framework: snippet.framework || 'none',
        platform: snippet.platform,
        tags: snippet.tags,
        isFavorite: snippet.isFavorite,
      });
    }
  }, [snippet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    
    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    // Command-specific validation
    if (formData.type === 'command' && formData.content.trim()) {
      if (looksLikeCode(formData.content) && !looksLikeCommand(formData.content)) {
        newErrors.content = 'This looks like code, not a terminal command. Please save it as a Code Snippet instead.';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save snippet';
      setSaveError(message);
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  };

  // Check if editing an existing snippet (prevents type change)
  const isEditing = !!snippet;

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const inputStyles: React.CSSProperties = {
    backgroundColor: 'var(--color-input-bg)',
    borderColor: 'var(--color-input-border)',
    color: 'var(--color-text-primary)',
  };

  const labelStyles: React.CSSProperties = {
    color: 'var(--color-text-secondary)',
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Type Toggle */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium" style={labelStyles}>Type</label>
          {isEditing && (
            <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-muted)' }}>
              <FiInfo size={12} />
              Type cannot be changed while editing
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <motion.button
            type="button"
            onClick={() => !isEditing && setFormData(prev => ({ ...prev, type: 'snippet', platform: 'na' }))}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer"
            style={{
              borderColor: formData.type === 'snippet' ? 'var(--color-brand-primary)' : 'var(--color-border-primary)',
              backgroundColor: formData.type === 'snippet' ? 'var(--color-brand-light)' : 'transparent',
              color: formData.type === 'snippet' ? 'var(--color-brand-text)' : 'var(--color-text-secondary)',
              opacity: isEditing && formData.type !== 'snippet' ? 0.4 : 1,
              cursor: isEditing ? 'not-allowed' : 'pointer',
            }}
            whileHover={!isEditing ? { scale: 1.02 } : {}}
            whileTap={!isEditing ? { scale: 0.98 } : {}}
            disabled={isEditing}
          >
            <FiCode size={18} />
            Code Snippet
          </motion.button>
          {!isEditing ? (
            <motion.button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, type: 'command', language: 'shell' }))}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 cursor-pointer"
              style={{
                borderColor: formData.type === 'command' ? 'var(--color-success)' : 'var(--color-border-primary)',
                backgroundColor: formData.type === 'command' ? 'var(--color-success-light)' : 'transparent',
                color: formData.type === 'command' ? 'var(--color-success-text)' : 'var(--color-text-secondary)',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiTerminal size={18} />
              Terminal Command
            </motion.button>
          ) : formData.type === 'command' && (
            <motion.button
              type="button"
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-2"
              style={{
                borderColor: 'var(--color-success)',
                backgroundColor: 'var(--color-success-light)',
                color: 'var(--color-success-text)',
                cursor: 'not-allowed',
              }}
              disabled
            >
              <FiTerminal size={18} />
              Terminal Command
            </motion.button>
          )}
        </div>
      </div>

      {/* Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" style={labelStyles}>
          Title <span style={{ color: 'var(--color-error)' }}>*</span>
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => {
            setFormData(prev => ({ ...prev, title: e.target.value }));
            setErrors(prev => ({ ...prev, title: '' }));
          }}
          placeholder={formData.type === 'command' ? 'e.g., Find listening ports' : 'e.g., React useState hook example'}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none"
          style={{
            ...inputStyles,
            borderColor: errors.title ? 'var(--color-error)' : 'var(--color-input-border)',
          }}
        />
        {errors.title && <p className="text-sm mt-1" style={{ color: 'var(--color-error)' }}>{errors.title}</p>}
      </div>

      {/* Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1" style={labelStyles}>Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Add a brief description..."
          rows={2}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none resize-none"
          style={inputStyles}
        />
      </div>

      {/* Language & Platform/Framework */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <CustomSelect
          value={formData.language}
          onChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
          options={LANGUAGE_OPTIONS}
          label="Language"
        />
        
        {formData.type === 'command' ? (
          <CustomSelect
            value={formData.platform}
            onChange={(value) => setFormData(prev => ({ ...prev, platform: value as Platform }))}
            options={PLATFORMS}
            label="Platform"
          />
        ) : (
          <CustomSelect
            value={formData.framework || 'none'}
            onChange={(value) => setFormData(prev => ({ ...prev, framework: value as Framework }))}
            options={FRAMEWORKS}
            label="Framework"
          />
        )}
      </div>

      {/* Category (for snippets) */}
      {formData.type === 'snippet' && (
        <div className="mb-4">
          <CustomSelect
            value={formData.category || 'general'}
            onChange={(value) => setFormData(prev => ({ ...prev, category: value as Category }))}
            options={CATEGORIES}
            label="Category"
          />
        </div>
      )}

      {/* Code Editor */}
      <div className="mb-4 flex-1">
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium" style={labelStyles}>
            {formData.type === 'command' ? 'Command' : 'Code'} <span style={{ color: 'var(--color-error)' }}>*</span>
          </label>
          {formData.type === 'snippet' && (
            <button
              type="button"
              onClick={handleFormatCode}
              className="flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors cursor-pointer"
              style={{ 
                color: 'var(--color-text-tertiary)',
                backgroundColor: 'transparent',
              }}
              title="Format code (Shift+Alt+F)"
            >
              <FiAlignLeft size={14} />
              Format
            </button>
          )}
        </div>
        <div 
          className="border rounded-lg overflow-hidden"
          style={{ borderColor: errors.content ? 'var(--color-error)' : 'var(--color-border-secondary)' }}
        >
          <Editor
            height="300px"
            language={getMonacoLanguage(formData.language)}
            value={formData.content}
            onChange={(value) => {
              setFormData(prev => ({ ...prev, content: value || '' }));
              setErrors(prev => ({ ...prev, content: '' }));
            }}
            theme="vs-dark"
            onMount={handleEditorMount}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: formData.type === 'snippet' ? 'on' : 'off',
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              padding: { top: 10, bottom: 10 },
              formatOnPaste: true,
              formatOnType: true,
            }}
          />
        </div>
        {errors.content && <p className="text-sm mt-1" style={{ color: 'var(--color-error)' }}>{errors.content}</p>}
      </div>

      {/* Tags */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1" style={labelStyles}>Tags</label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a tag..."
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none"
            style={inputStyles}
          />
          <button
            type="button"
            onClick={handleAddTag}
            className="px-4 py-2 rounded-lg transition-colors cursor-pointer"
            style={{ 
              backgroundColor: 'var(--color-bg-tertiary)',
              color: 'var(--color-text-secondary)'
            }}
          >
            <FiPlus size={18} />
          </button>
        </div>
        
        {/* Current Tags */}
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 px-3 py-1 rounded-full text-sm"
                style={{ 
                  backgroundColor: 'var(--color-brand-light)',
                  color: 'var(--color-brand-text)'
                }}
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="cursor-pointer"
                  style={{ color: 'var(--color-brand-text)' }}
                >
                  <FiX size={14} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Suggested Tags */}
        {existingTags.length > 0 && (
          <div className="mt-2">
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Suggested: </span>
            <div className="flex flex-wrap gap-1 mt-1">
              {existingTags
                .filter(t => !formData.tags.includes(t))
                .slice(0, 10)
                .map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }))}
                    className="px-2 py-0.5 text-xs rounded-full transition-colors cursor-pointer"
                    style={{ 
                      backgroundColor: 'var(--color-tag-bg)',
                      color: 'var(--color-tag-text)'
                    }}
                  >
                    +{tag}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Favorite */}
      <div className="mb-6">
        <CustomCheckbox
          checked={formData.isFavorite}
          onChange={(checked) => setFormData(prev => ({ ...prev, isFavorite: checked }))}
          label="Add to favorites"
          description="Mark this item for quick access"
          variant="favorite"
        />
      </div>

      {/* Error Display */}
      {saveError && (
        <div 
          className="mb-4 p-3 border rounded-lg flex items-center gap-2"
          style={{ 
            backgroundColor: 'var(--color-error-light)',
            borderColor: 'var(--color-error)',
            color: 'var(--color-error-text)'
          }}
        >
          <FiAlertCircle size={18} />
          <span className="text-sm">{saveError}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div 
        className="flex justify-end gap-3 pt-4 border-t"
        style={{ borderColor: 'var(--color-border-primary)' }}
      >
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 rounded-lg transition-colors cursor-pointer"
          style={{ 
            backgroundColor: 'var(--color-bg-tertiary)',
            color: 'var(--color-text-secondary)'
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          style={{ backgroundColor: 'var(--color-brand-primary)' }}
        >
          <FiSave size={18} />
          {saving ? 'Saving...' : snippet ? 'Update' : 'Save'}
        </button>
      </div>
    </form>
  );
};