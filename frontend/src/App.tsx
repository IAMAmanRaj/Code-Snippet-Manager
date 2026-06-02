import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Header,
  Sidebar,
  SearchBar,
  SnippetList,
  SnippetViewer,
  SnippetEditor,
  Modal,
  Toast,
  ImportExport,
  MobileBlocker,
} from './components';
import { useSnippets, useTags, useStats, useRecentSnippets } from './hooks/useSnippets';
import { useToast } from './hooks/useToast';
import { useTheme } from './hooks/useTheme';
import type { Snippet, SnippetFormData, FilterState } from './types';
import * as api from './services/api';

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut' as const,
    },
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: {
      duration: 0.2,
    },
  },
};

type ViewType = 'all' | 'snippets' | 'commands' | 'favorites' | 'recent';

function App() {
  // State
  const [activeView, setActiveView] = useState<ViewType>('all');
  const [selectedSnippet, setSelectedSnippet] = useState<Snippet | null>(null);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [importExportMode, setImportExportMode] = useState<'import' | 'export' | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Hooks
  const { isDark, toggleTheme } = useTheme();
  
  const {
    snippets,
    loading,
    error,
    totalCount,
    filters,
    fetchSnippets,
    createSnippet,
    updateSnippet,
    deleteSnippet,
    toggleFavorite,
    updateFilters,
    resetFilters,
  } = useSnippets();

  const { tags, refetch: refetchTags } = useTags();
  const { stats, refetch: refetchStats } = useStats();
  const { snippets: recentSnippets, refetch: refetchRecent } = useRecentSnippets(10);
  const { toasts, addToast, removeToast } = useToast();

  // Handle view changes
  useEffect(() => {
    switch (activeView) {
      case 'snippets':
        updateFilters({ type: 'snippet', favorite: false });
        break;
      case 'commands':
        updateFilters({ type: 'command', favorite: false });
        break;
      case 'favorites':
        updateFilters({ type: '', favorite: true });
        break;
      case 'recent':
        // Recent view uses a different data source
        break;
      default:
        updateFilters({ type: '', favorite: false });
    }
  }, [activeView]);

  // Get display snippets based on active view
  const displaySnippets = activeView === 'recent' ? recentSnippets : snippets;

  // Handlers
  const handleNewSnippet = () => {
    setEditingSnippet(null);
    setIsEditorOpen(true);
  };

  const handleEditSnippet = (snippet: Snippet) => {
    setEditingSnippet(snippet);
    setIsViewerOpen(false);
    setIsEditorOpen(true);
  };

  const handleViewSnippet = async (snippet: Snippet) => {
    try {
      // Fetch full snippet details (updates access count)
      const fullSnippet = await api.getSnippet(snippet._id);
      setSelectedSnippet(fullSnippet);
      setIsViewerOpen(true);
    } catch (err) {
      addToast('Failed to load snippet', 'error');
    }
  };

  const handleSaveSnippet = async (data: SnippetFormData) => {
    try {
      if (editingSnippet) {
        await updateSnippet(editingSnippet._id, data);
        addToast('Snippet updated successfully', 'success');
      } else {
        await createSnippet(data);
        addToast('Snippet created successfully', 'success');
      }
      setIsEditorOpen(false);
      setEditingSnippet(null);
      refetchTags();
      refetchStats();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save snippet';
      addToast(message, 'error');
      throw err;
    }
  };

  const handleDeleteSnippet = async (id: string) => {
    try {
      await deleteSnippet(id);
      addToast('Snippet deleted successfully', 'success');
      setIsViewerOpen(false);
      setSelectedSnippet(null);
      refetchTags();
      refetchStats();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete snippet';
      addToast(message, 'error');
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      const updated = await toggleFavorite(id);
      if (selectedSnippet && selectedSnippet._id === id) {
        setSelectedSnippet(updated);
      }
      addToast(
        updated.isFavorite ? 'Added to favorites' : 'Removed from favorites',
        'success'
      );
      refetchStats();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update favorite';
      addToast(message, 'error');
    }
  };

  const handleCopy = () => {
    addToast('Copied to clipboard!', 'success');
  };

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    // Show searching state when search term changes
    if ('search' in newFilters && newFilters.search !== filters.search) {
      if (newFilters.search && newFilters.search.length > 0) {
        setIsSearching(true);
      } else {
        setIsSearching(false);
      }
    }
    updateFilters(newFilters);
  };

  // Handle searching state - hide it once loading completes
  useEffect(() => {
    if (!loading && isSearching) {
      // Add a small delay before hiding the searching state for smoother UX
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading, isSearching]);

  const handleRefresh = () => {
    fetchSnippets();
    refetchTags();
    refetchStats();
    refetchRecent();
  };

  return (
    <>
      {/* Mobile Blocker - only visible on screens < 768px */}
      <MobileBlocker />

      {/* Main App Content - hidden on screens < 768px */}
      <div className="app-content min-h-screen" style={{ backgroundColor: 'var(--color-bg-primary)' }}>
        {/* Header */}
        <Header
          onNewSnippet={handleNewSnippet}
          onExport={() => setImportExportMode('export')}
          onImport={() => setImportExportMode('import')}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />

        <div className="flex">
          {/* Sidebar */}
          <Sidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={resetFilters}
            tags={tags}
            stats={stats}
            activeView={activeView}
            onViewChange={(view) => {
              setActiveView(view);
              if (view === 'recent') {
                refetchRecent();
              }
            }}
          />

          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            {/* Search Bar */}
            <div className="mb-6">
              <SearchBar
                value={filters.search}
                onChange={(search) => handleFilterChange({ search })}
                placeholder={`Search ${activeView === 'commands' ? 'commands' : activeView === 'snippets' ? 'snippets' : 'snippets and commands'}...`}
                loading={isSearching}
              />
            </div>

            {/* Results Header with Animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 
                    className="text-lg font-semibold"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {activeView === 'recent' ? 'Recently Accessed' : 
                     activeView === 'favorites' ? 'Favorites' :
                     activeView === 'commands' ? 'Terminal Commands' :
                     activeView === 'snippets' ? 'Code Snippets' : 'All Items'}
                    {activeView !== 'recent' && (
                      <motion.span 
                        className="ml-2 font-normal"
                        style={{ color: 'var(--color-text-muted)' }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                      >
                        ({totalCount})
                      </motion.span>
                    )}
                  </h2>
                </div>

                {/* Error State */}
                <AnimatePresence>
                  {error && (
                    <motion.div 
                      className="px-4 py-3 rounded-lg mb-4 border"
                      style={{
                        backgroundColor: 'var(--color-error-light)',
                        borderColor: 'var(--color-error)',
                        color: 'var(--color-error-text)',
                      }}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Snippet List */}
                <SnippetList
                  snippets={displaySnippets}
                  loading={loading}
                  searching={isSearching && loading}
                  onView={handleViewSnippet}
                  onEdit={handleEditSnippet}
                  onDelete={handleDeleteSnippet}
                  onToggleFavorite={handleToggleFavorite}
                  onCopy={handleCopy}
                />
              </motion.div>
            </AnimatePresence>
          </main>
      </div>

        {/* Editor Modal */}
        <Modal
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingSnippet(null);
          }}
          title={editingSnippet ? 'Edit Snippet' : 'New Snippet'}
          size="xl"
        >
          <SnippetEditor
            snippet={editingSnippet}
            onSave={handleSaveSnippet}
            onCancel={() => {
              setIsEditorOpen(false);
              setEditingSnippet(null);
            }}
            existingTags={tags.map(t => t.tag)}
          />
        </Modal>

        {/* Viewer Modal */}
        <Modal
          isOpen={isViewerOpen}
          onClose={() => {
            setIsViewerOpen(false);
            setSelectedSnippet(null);
          }}
          title=""
          size="xl"
        >
          {selectedSnippet && (
            <SnippetViewer
              snippet={selectedSnippet}
              onEdit={() => handleEditSnippet(selectedSnippet)}
              onDelete={() => handleDeleteSnippet(selectedSnippet._id)}
              onToggleFavorite={() => handleToggleFavorite(selectedSnippet._id)}
              onCopy={handleCopy}
            />
          )}
        </Modal>

        {/* Import/Export Modal */}
        <Modal
          isOpen={importExportMode !== null}
          onClose={() => setImportExportMode(null)}
          title={importExportMode === 'import' ? 'Import Snippets' : 'Export Snippets'}
          size="md"
        >
          {importExportMode && (
            <ImportExport
              mode={importExportMode}
              onClose={() => setImportExportMode(null)}
              onSuccess={(message) => addToast(message, 'success')}
              onError={(message) => addToast(message, 'error')}
              onRefresh={handleRefresh}
            />
          )}
        </Modal>

        {/* Toast Notifications */}
        <Toast toasts={toasts} onRemove={removeToast} />
      </div>
    </>
  );
}

export default App;
