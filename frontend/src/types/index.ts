export type SnippetType = 'snippet' | 'command';
export type Platform = 'windows' | 'linux' | 'mac' | 'all' | 'na';
export type Category = 
  | 'general'
  | 'component'
  | 'hook'
  | 'utility'
  | 'api'
  | 'style'
  | 'config'
  | 'test'
  | 'type'
  | 'context'
  | 'redux'
  | 'form'
  | 'animation'
  | 'layout'
  | 'navigation'
  | 'auth'
  | 'data-fetching'
  | 'error-handling'
  | 'performance'
  | 'accessibility'
  | 'other';

export type Framework = 
  | 'none'
  | 'react'
  | 'nextjs'
  | 'vue'
  | 'angular'
  | 'svelte'
  | 'express'
  | 'nestjs'
  | 'fastapi'
  | 'django'
  | 'flask'
  | 'spring'
  | 'other';

export interface Snippet {
  _id: string;
  title: string;
  content: string;
  description: string;
  type: SnippetType;
  language: string;
  category: Category;
  framework: Framework;
  platform: Platform;
  tags: string[];
  isFavorite: boolean;
  accessCount: number;
  lastAccessedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SnippetFormData {
  title: string;
  content: string;
  description: string;
  type: SnippetType;
  language: string;
  category: Category;
  framework: Framework;
  platform: Platform;
  tags: string[];
  isFavorite: boolean;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface SnippetsResponse {
  snippets: Snippet[];
  pagination: PaginationInfo;
}

export interface TagInfo {
  tag: string;
  count: number;
}

export interface LanguageInfo {
  language: string;
  count: number;
}

export interface Stats {
  totalSnippets: number;
  totalCommands: number;
  totalFavorites: number;
  total: number;
  typeStats: { _id: string; count: number }[];
  languageStats: { _id: string; count: number }[];
  categoryStats: { _id: string; count: number }[];
  frameworkStats: { _id: string; count: number }[];
  platformStats: { _id: string; count: number }[];
}

export interface CategoryInfo {
  category: string;
  count: number;
}

export interface FrameworkInfo {
  framework: string;
  count: number;
}

export interface ExportData {
  exportDate: string;
  version: string;
  count: number;
  snippets: Snippet[];
}

export interface ImportResult {
  message: string;
  imported: number;
  skipped: number;
  errors: number;
  total: number;
}

export interface FilterState {
  search: string;
  type: SnippetType | '';
  language: string;
  category: Category | '';
  framework: Framework | '';
  platform: Platform | '';
  tags: string[];
  favorite: boolean;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}