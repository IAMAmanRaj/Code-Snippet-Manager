import { useState, useEffect, useCallback } from 'react';
import type { Snippet, FilterState, TagInfo, LanguageInfo, CategoryInfo, FrameworkInfo, Stats } from '../types';
import * as api from '../services/api';
import { ApiError } from '../services/api';

export const useSnippets = () => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: '',
    language: '',
    category: '',
    framework: '',
    platform: '',
    tags: [],
    favorite: false,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const fetchSnippets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getSnippets(filters);
      setSnippets(response.snippets);
      setTotalCount(response.pagination.total);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to fetch snippets';
      setError(message);
      console.error('Fetch snippets error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSnippets();
  }, [fetchSnippets]);

  const createSnippet = async (data: Parameters<typeof api.createSnippet>[0]) => {
    try {
      const newSnippet = await api.createSnippet(data);
      setSnippets(prev => [newSnippet, ...prev]);
      setTotalCount(prev => prev + 1);
      return newSnippet;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to create snippet';
      throw new Error(message);
    }
  };

  const updateSnippet = async (id: string, data: Parameters<typeof api.updateSnippet>[1]) => {
    try {
      const updated = await api.updateSnippet(id, data);
      setSnippets(prev => prev.map(s => s._id === id ? updated : s));
      return updated;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to update snippet';
      throw new Error(message);
    }
  };

  const deleteSnippet = async (id: string) => {
    try {
      await api.deleteSnippet(id);
      setSnippets(prev => prev.filter(s => s._id !== id));
      setTotalCount(prev => prev - 1);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to delete snippet';
      throw new Error(message);
    }
  };

  const toggleFavorite = async (id: string) => {
    try {
      const updated = await api.toggleFavorite(id);
      setSnippets(prev => prev.map(s => s._id === id ? updated : s));
      return updated;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to toggle favorite';
      throw new Error(message);
    }
  };

  const updateFilters = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      type: '',
      language: '',
      category: '',
      framework: '',
      platform: '',
      tags: [],
      favorite: false,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  return {
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
  };
};

export const useRecentSnippets = (limit: number = 10) => {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getRecentSnippets(limit);
      setSnippets(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to fetch recent snippets';
      setError(message);
      console.error('Fetch recent error:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchRecent();
  }, [fetchRecent]);

  return { snippets, loading, error, refetch: fetchRecent };
};

export const useTags = () => {
  const [tags, setTags] = useState<TagInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTags = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getTags();
      setTags(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to fetch tags';
      setError(message);
      console.error('Fetch tags error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  return { tags, loading, error, refetch: fetchTags };
};

export const useLanguages = () => {
  const [languages, setLanguages] = useState<LanguageInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLanguages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getLanguages();
      setLanguages(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to fetch languages';
      setError(message);
      console.error('Fetch languages error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  return { languages, loading, error, refetch: fetchLanguages };
};

export const useCategories = () => {
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to fetch categories';
      setError(message);
      console.error('Fetch categories error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return { categories, loading, error, refetch: fetchCategories };
};

export const useFrameworks = () => {
  const [frameworks, setFrameworks] = useState<FrameworkInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFrameworks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getFrameworks();
      setFrameworks(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to fetch frameworks';
      setError(message);
      console.error('Fetch frameworks error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFrameworks();
  }, [fetchFrameworks]);

  return { frameworks, loading, error, refetch: fetchFrameworks };
};

export const useStats = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to fetch stats';
      setError(message);
      console.error('Fetch stats error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};