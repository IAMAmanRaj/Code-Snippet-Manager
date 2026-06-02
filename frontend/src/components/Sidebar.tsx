import React from 'react';
import { motion } from 'framer-motion';
import { 
  FiCode, 
  FiTerminal, 
  FiStar, 
  FiClock, 
  FiTag,
  FiFilter,
  FiX,
  FiGrid
} from 'react-icons/fi';
import type { FilterState, TagInfo, Stats } from '../types';
import { CustomSelect } from './CustomSelect';

interface SidebarProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  tags: TagInfo[];
  stats: Stats | null;
  activeView: 'all' | 'snippets' | 'commands' | 'favorites' | 'recent';
  onViewChange: (view: 'all' | 'snippets' | 'commands' | 'favorites' | 'recent') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  tags,
  stats,
  activeView,
  onViewChange,
}) => {
  const navItems = [
    { id: 'all' as const, label: 'All Items', icon: FiGrid, count: stats?.total || 0 },
    { id: 'snippets' as const, label: 'Code Snippets', icon: FiCode, count: stats?.totalSnippets || 0 },
    { id: 'commands' as const, label: 'Commands', icon: FiTerminal, count: stats?.totalCommands || 0 },
    { id: 'favorites' as const, label: 'Favorites', icon: FiStar, count: stats?.totalFavorites || 0 },
    { id: 'recent' as const, label: 'Recent', icon: FiClock, count: null },
  ];

  const hasActiveFilters = filters.search || filters.language || filters.category || filters.framework || filters.platform || filters.tags.length > 0;

  return (
    <aside 
      className="w-64 flex flex-col h-[calc(100vh-73px)] sticky top-[73px] border-r"
      style={{ 
        backgroundColor: 'var(--color-sidebar-bg)',
        borderColor: 'var(--color-border-primary)'
      }}
    >
      {/* Navigation */}
      <nav 
        className="p-4 border-b"
        style={{ borderColor: 'var(--color-border-primary)' }}
      >
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <motion.button
                onClick={() => onViewChange(item.id)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer relative"
                style={{
                  backgroundColor: activeView === item.id ? 'var(--color-brand-light)' : 'transparent',
                  color: activeView === item.id ? 'var(--color-brand-text)' : 'var(--color-text-secondary)',
                }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.count !== null && (
                  <span 
                    className="text-sm"
                    style={{ 
                      color: activeView === item.id ? 'var(--color-brand-primary)' : 'var(--color-text-muted)' 
                    }}
                  >
                    {item.count}
                  </span>
                )}
              </motion.button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Filters */}
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <div 
            className="flex items-center gap-2"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            <FiFilter size={16} />
            <span className="font-semibold text-sm">Filters</span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="text-xs flex items-center gap-1 cursor-pointer"
              style={{ color: 'var(--color-brand-primary)' }}
            >
              <FiX size={12} />
              Clear
            </button>
          )}
        </div>

        {/* Language Filter */}
        <div className="mb-4">
          <CustomSelect
            value={filters.language}
            onChange={(value) => onFilterChange({ language: value })}
            options={[
              { value: '', label: 'All Languages' },
              ...(stats?.languageStats?.map((lang) => ({
                value: lang._id,
                label: `${lang._id} (${lang.count})`,
              })) || []),
            ]}
            label="Language"
          />
        </div>

        {/* Platform Filter (for commands) */}
        {(activeView === 'commands' || activeView === 'all') && (
          <div className="mb-4">
            <CustomSelect
              value={filters.platform}
              onChange={(value) => onFilterChange({ platform: value as FilterState['platform'] })}
              options={[
                { value: '', label: 'All Platforms' },
                { value: 'windows', label: 'Windows' },
                { value: 'linux', label: 'Linux' },
                { value: 'mac', label: 'macOS' },
                { value: 'all', label: 'Cross-platform' },
              ]}
              label="Platform"
            />
          </div>
        )}

        {/* Category Filter (for snippets) */}
        {(activeView === 'snippets' || activeView === 'all') && stats?.categoryStats && stats.categoryStats.length > 0 && (
          <div className="mb-4">
            <CustomSelect
              value={filters.category}
              onChange={(value) => onFilterChange({ category: value as FilterState['category'] })}
              options={[
                { value: '', label: 'All Categories' },
                ...(stats.categoryStats.map((cat) => ({
                  value: cat._id,
                  label: `${cat._id.charAt(0).toUpperCase() + cat._id.slice(1).replace('-', ' ')} (${cat.count})`,
                }))),
              ]}
              label="Category"
            />
          </div>
        )}

        {/* Framework Filter (for snippets) */}
        {(activeView === 'snippets' || activeView === 'all') && stats?.frameworkStats && stats.frameworkStats.length > 0 && (
          <div className="mb-4">
            <CustomSelect
              value={filters.framework}
              onChange={(value) => onFilterChange({ framework: value as FilterState['framework'] })}
              options={[
                { value: '', label: 'All Frameworks' },
                ...(stats.frameworkStats.map((fw) => ({
                  value: fw._id,
                  label: `${fw._id.charAt(0).toUpperCase() + fw._id.slice(1)} (${fw.count})`,
                }))),
              ]}
              label="Framework"
            />
          </div>
        )}

        {/* Sort */}
        <div className="mb-4">
          <CustomSelect
            value={`${filters.sortBy}-${filters.sortOrder}`}
            onChange={(value) => {
              const [sortBy, sortOrder] = value.split('-');
              onFilterChange({ sortBy, sortOrder: sortOrder as 'asc' | 'desc' });
            }}
            options={[
              { value: 'createdAt-desc', label: 'Newest First' },
              { value: 'createdAt-asc', label: 'Oldest First' },
              { value: 'updatedAt-desc', label: 'Recently Updated' },
              { value: 'title-asc', label: 'Title A-Z' },
              { value: 'title-desc', label: 'Title Z-A' },
              { value: 'accessCount-desc', label: 'Most Accessed' },
            ]}
            label="Sort By"
          />
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FiTag size={14} style={{ color: 'var(--color-text-tertiary)' }} />
              <span 
                className="text-xs font-medium"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Tags
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 15).map((tag) => (
                <button
                  key={tag.tag}
                  onClick={() => {
                    const newTags = filters.tags.includes(tag.tag)
                      ? filters.tags.filter(t => t !== tag.tag)
                      : [...filters.tags, tag.tag];
                    onFilterChange({ tags: newTags });
                  }}
                  className="px-2 py-1 text-xs rounded-full transition-colors border cursor-pointer"
                  style={{
                    backgroundColor: filters.tags.includes(tag.tag) 
                      ? 'var(--color-tag-active-bg)' 
                      : 'var(--color-tag-bg)',
                    color: filters.tags.includes(tag.tag) 
                      ? 'var(--color-tag-active-text)' 
                      : 'var(--color-tag-text)',
                    borderColor: filters.tags.includes(tag.tag) 
                      ? 'var(--color-brand-primary)' 
                      : 'transparent',
                  }}
                >
                  {tag.tag}
                  <span className="ml-1 opacity-60">{tag.count}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      {stats && (
        <div 
          className="p-4 border-t"
          style={{ 
            borderColor: 'var(--color-border-primary)',
            backgroundColor: 'var(--color-bg-tertiary)'
          }}
        >
          <div className="grid grid-cols-2 gap-2 text-center">
            <div 
              className="rounded-lg p-2 border"
              style={{ 
                backgroundColor: 'var(--color-card-bg)',
                borderColor: 'var(--color-border-primary)'
              }}
            >
              <div 
                className="text-lg font-bold"
                style={{ color: 'var(--color-brand-primary)' }}
              >
                {stats.totalSnippets}
              </div>
              <div 
                className="text-xs"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Snippets
              </div>
            </div>
            <div 
              className="rounded-lg p-2 border"
              style={{ 
                backgroundColor: 'var(--color-card-bg)',
                borderColor: 'var(--color-border-primary)'
              }}
            >
              <div 
                className="text-lg font-bold"
                style={{ color: 'var(--color-success)' }}
              >
                {stats.totalCommands}
              </div>
              <div 
                className="text-xs"
                style={{ color: 'var(--color-text-tertiary)' }}
              >
                Commands
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};