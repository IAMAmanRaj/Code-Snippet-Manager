import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiDownload, FiFile, FiCheck, FiChevronDown, FiChevronUp, FiInfo } from 'react-icons/fi';
import * as api from '../services/api';
import { ApiError } from '../services/api';
import { downloadJSON, parseJSONFile } from '../utils';
import type { ExportData, ImportResult } from '../types';
import { CustomCheckbox } from './CustomCheckbox';

interface ImportExportProps {
  mode: 'import' | 'export';
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onRefresh: () => void;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Example JSON format for users
const EXAMPLE_JSON_FORMAT = `{
  "snippets": [
    {
      "title": "React useState Hook",
      "content": "const [state, setState] = useState(initialValue);",
      "description": "Basic useState hook example",
      "type": "snippet",
      "language": "typescript",
      "category": "hook",
      "framework": "react",
      "platform": "na",
      "tags": ["react", "hooks", "state"],
      "isFavorite": false
    },
    {
      "title": "List Docker Containers",
      "content": "docker ps -a",
      "description": "List all Docker containers",
      "type": "command",
      "language": "shell",
      "category": "general",
      "framework": "none",
      "platform": "all",
      "tags": ["docker", "containers"],
      "isFavorite": true
    }
  ]
}`;

export const ImportExport: React.FC<ImportExportProps> = ({
  mode,
  onClose,
  onSuccess,
  onError,
  onRefresh,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [overwrite, setOverwrite] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showFormatGuide, setShowFormatGuide] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const data = await api.exportSnippets();
      const filename = `snippets-export-${new Date().toISOString().split('T')[0]}.json`;
      downloadJSON(data, filename);
      onSuccess(`Successfully exported ${data.count} items`);
      onClose();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : 'Failed to export snippets';
      onError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const data = await parseJSONFile(selectedFile) as ExportData;
      
      if (!data.snippets || !Array.isArray(data.snippets)) {
        throw new Error('Invalid import file format. Expected a JSON file with a "snippets" array.');
      }

      if (data.snippets.length === 0) {
        throw new Error('The import file contains no snippets.');
      }

      const result = await api.importSnippets(data.snippets, overwrite);
      setImportResult(result);
      
      if (result.imported > 0) {
        onSuccess(`Successfully imported ${result.imported} items`);
      } else if (result.skipped > 0) {
        onSuccess(`Import completed: ${result.skipped} items skipped (already exist)`);
      }
      onRefresh();
    } catch (error) {
      let message = 'Failed to import snippets';
      if (error instanceof ApiError) {
        message = error.message;
      } else if (error instanceof Error) {
        message = error.message;
      }
      onError(message);
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'export') {
    return (
      <motion.div 
        className="text-center py-6"
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-brand-light)' }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <FiDownload size={32} style={{ color: 'var(--color-brand-primary)' }} />
        </motion.div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Export All Snippets</h3>
        <p className="mb-6" style={{ color: 'var(--color-text-tertiary)' }}>
          Download all your snippets and commands as a JSON file. You can use this file to backup your data or import it later.
        </p>
        <div className="flex justify-center gap-3">
          <motion.button
            onClick={onClose}
            className="px-6 py-2 rounded-lg transition-colors cursor-pointer"
            style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
          <motion.button
            onClick={handleExport}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            style={{ backgroundColor: 'var(--color-brand-primary)' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiDownload size={18} />
            {loading ? 'Exporting...' : 'Export'}
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="py-4"
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-6">
        <motion.div 
          className="p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-success-light)' }}
          whileHover={{ scale: 1.1, rotate: -5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <FiUpload size={32} style={{ color: 'var(--color-success)' }} />
        </motion.div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Import Snippets</h3>
        <p style={{ color: 'var(--color-text-tertiary)' }}>
          Import snippets and commands from a JSON file.
        </p>
      </div>

      {/* JSON Format Guide */}
      <div className="mb-6">
        <motion.button
          onClick={() => setShowFormatGuide(!showFormatGuide)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer"
          style={{ 
            backgroundColor: 'var(--color-info-light)', 
            color: 'var(--color-info-text)' 
          }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <div className="flex items-center gap-2">
            <FiInfo size={18} />
            <span className="text-sm font-medium">View Expected JSON Format</span>
          </div>
          {showFormatGuide ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
        </motion.button>
        
        <AnimatePresence>
          {showFormatGuide && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div 
                className="mt-3 p-4 rounded-lg border"
                style={{ 
                  backgroundColor: 'var(--color-bg-tertiary)', 
                  borderColor: 'var(--color-border-primary)' 
                }}
              >
                <p className="text-sm mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                  Your JSON file should follow this structure:
                </p>
                <div 
                  className="rounded-lg p-3 overflow-x-auto text-xs font-mono"
                  style={{ backgroundColor: 'var(--color-snippet-bg)', color: '#e2e8f0' }}
                >
                  <pre className="whitespace-pre">{EXAMPLE_JSON_FORMAT}</pre>
                </div>
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                    Required fields:
                  </p>
                  <ul className="text-xs space-y-1" style={{ color: 'var(--color-text-tertiary)' }}>
                    <li>• <code className="px-1 rounded" style={{ backgroundColor: 'var(--color-bg-hover)' }}>title</code> - Name of the snippet</li>
                    <li>• <code className="px-1 rounded" style={{ backgroundColor: 'var(--color-bg-hover)' }}>content</code> - The code or command</li>
                    <li>• <code className="px-1 rounded" style={{ backgroundColor: 'var(--color-bg-hover)' }}>type</code> - Either "snippet" or "command"</li>
                    <li>• <code className="px-1 rounded" style={{ backgroundColor: 'var(--color-bg-hover)' }}>language</code> - Programming language (e.g., javascript, python, shell)</li>
                  </ul>
                  <p className="text-xs font-semibold mt-2" style={{ color: 'var(--color-text-secondary)' }}>
                    Optional fields:
                  </p>
                  <ul className="text-xs space-y-1" style={{ color: 'var(--color-text-tertiary)' }}>
                    <li>• <code className="px-1 rounded" style={{ backgroundColor: 'var(--color-bg-hover)' }}>description</code> - Brief description</li>
                    <li>• <code className="px-1 rounded" style={{ backgroundColor: 'var(--color-bg-hover)' }}>tags</code> - Array of tag strings</li>
                    <li>• <code className="px-1 rounded" style={{ backgroundColor: 'var(--color-bg-hover)' }}>category</code> - Category (component, hook, utility, etc.)</li>
                    <li>• <code className="px-1 rounded" style={{ backgroundColor: 'var(--color-bg-hover)' }}>framework</code> - Framework (react, vue, angular, etc.)</li>
                    <li>• <code className="px-1 rounded" style={{ backgroundColor: 'var(--color-bg-hover)' }}>platform</code> - For commands: windows, linux, mac, or all</li>
                    <li>• <code className="px-1 rounded" style={{ backgroundColor: 'var(--color-bg-hover)' }}>isFavorite</code> - Boolean to mark as favorite</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* File Selection */}
      <div className="mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />
        <motion.button
          onClick={() => fileInputRef.current?.click()}
          className="w-full p-6 border-2 border-dashed rounded-xl transition-colors cursor-pointer"
          style={{ borderColor: 'var(--color-border-secondary)' }}
          whileHover={{ 
            scale: 1.01, 
            borderColor: 'var(--color-brand-primary)',
          }}
          whileTap={{ scale: 0.99 }}
        >
          {selectedFile ? (
            <motion.div 
              className="flex items-center justify-center gap-3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <FiFile size={24} style={{ color: 'var(--color-brand-primary)' }} />
              <span style={{ color: 'var(--color-text-secondary)' }}>{selectedFile.name}</span>
            </motion.div>
          ) : (
            <div className="text-center">
              <FiUpload size={32} className="mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
              <p style={{ color: 'var(--color-text-tertiary)' }}>Click to select a JSON file</p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>or drag and drop</p>
            </div>
          )}
        </motion.button>
      </div>

      {/* Overwrite Option */}
      <AnimatePresence>
        {selectedFile && !importResult && (
          <motion.div 
            className="mb-6"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <CustomCheckbox
              checked={overwrite}
              onChange={setOverwrite}
              label="Overwrite existing items"
              description="Replace items with matching titles"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import Result */}
      <AnimatePresence>
        {importResult && (
          <motion.div 
            className="mb-6 p-4 rounded-xl"
            style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, delay: 0.1 }}
              >
                <FiCheck size={20} style={{ color: 'var(--color-success)' }} />
              </motion.div>
              <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Import Complete</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <motion.div 
                className="p-3 rounded-lg" 
                style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="text-2xl font-bold" style={{ color: 'var(--color-success)' }}>{importResult.imported}</div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Imported</div>
              </motion.div>
              <motion.div 
                className="p-3 rounded-lg" 
                style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-2xl font-bold" style={{ color: 'var(--color-warning)' }}>{importResult.skipped}</div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Skipped</div>
              </motion.div>
              <motion.div 
                className="p-3 rounded-lg" 
                style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="text-2xl font-bold" style={{ color: 'var(--color-error)' }}>{importResult.errors}</div>
                <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Errors</div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex justify-center gap-3">
        <motion.button
          onClick={onClose}
          className="px-6 py-2 rounded-lg transition-colors cursor-pointer"
          style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {importResult ? 'Close' : 'Cancel'}
        </motion.button>
        {!importResult && (
          <motion.button
            onClick={handleImport}
            disabled={loading || !selectedFile}
            className="flex items-center gap-2 px-6 py-2 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            style={{ backgroundColor: 'var(--color-success)' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiUpload size={18} />
            {loading ? 'Importing...' : 'Import'}
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};