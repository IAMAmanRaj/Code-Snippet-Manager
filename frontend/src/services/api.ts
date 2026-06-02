import axios, { AxiosError } from 'axios';
import type { 
  Snippet, 
  SnippetFormData, 
  SnippetsResponse, 
  TagInfo, 
  LanguageInfo,
  CategoryInfo,
  FrameworkInfo,
  Stats,
  ExportData,
  ImportResult,
  FilterState
} from '../types';

// Get API base URL from environment variable
// In development, use Vite's import.meta.env
// In production, use the backend URL from environment variable
const getApiBase = (): string => {
  // Check if we're in development (Vite proxy) or production
  if (import.meta.env.DEV) {
    // Development: use relative path (Vite proxy will handle it)
    return '/api/snippets';
  } else {
    // Production: use full backend URL from environment variable
    const backendUrl = import.meta.env.VITE_API_BASE_URL || '';
    if (backendUrl) {
      // Remove trailing slash if present
      const baseUrl = backendUrl.replace(/\/$/, '');
      return `${baseUrl}/api/snippets`;
    }
    // Fallback to relative path if no URL is provided
    return '/api/snippets';
  }
};

const API_BASE = getApiBase();

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Error handler helper
interface ApiErrorResponse {
  message?: string;
  error?: string;
  errors?: string[];
}

export class ApiError extends Error {
  public statusCode: number;
  public details?: string[];

  constructor(message: string, statusCode: number, details?: string[]) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

function handleApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const data = axiosError.response?.data;
    const statusCode = axiosError.response?.status || 500;
    
    let message = 'An error occurred';
    let details: string[] | undefined;

    if (data) {
      message = data.error || data.message || message;
      details = data.errors;
    } else if (axiosError.message) {
      message = axiosError.message;
    }

    // Handle network errors
    if (axiosError.code === 'ECONNABORTED') {
      message = 'Request timed out. Please try again.';
    } else if (axiosError.code === 'ERR_NETWORK') {
      message = 'Network error. Please check your connection.';
    }

    throw new ApiError(message, statusCode, details);
  }
  
  throw new ApiError('An unexpected error occurred', 500);
}

// Snippets API
export const getSnippets = async (filters: Partial<FilterState> = {}): Promise<SnippetsResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.type) params.append('type', filters.type);
    if (filters.language) params.append('language', filters.language);
    if (filters.category) params.append('category', filters.category);
    if (filters.framework) params.append('framework', filters.framework);
    if (filters.platform) params.append('platform', filters.platform);
    if (filters.tags && filters.tags.length > 0) params.append('tags', filters.tags.join(','));
    if (filters.favorite) params.append('favorite', 'true');
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
    
    const response = await api.get<SnippetsResponse>(`/?${params.toString()}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getSnippet = async (id: string): Promise<Snippet> => {
  try {
    const response = await api.get<Snippet>(`/${id}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const createSnippet = async (data: SnippetFormData): Promise<Snippet> => {
  try {
    const response = await api.post<Snippet>('/', data);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const updateSnippet = async (id: string, data: Partial<SnippetFormData>): Promise<Snippet> => {
  try {
    const response = await api.put<Snippet>(`/${id}`, data);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const deleteSnippet = async (id: string): Promise<void> => {
  try {
    await api.delete(`/${id}`);
  } catch (error) {
    handleApiError(error);
  }
};

export const toggleFavorite = async (id: string): Promise<Snippet> => {
  try {
    const response = await api.patch<Snippet>(`/${id}/favorite`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Recent snippets
export const getRecentSnippets = async (limit: number = 10): Promise<Snippet[]> => {
  try {
    const response = await api.get<Snippet[]>(`/recent?limit=${limit}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Favorite snippets
export const getFavoriteSnippets = async (): Promise<Snippet[]> => {
  try {
    const response = await api.get<Snippet[]>('/favorites');
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Tags
export const getTags = async (): Promise<TagInfo[]> => {
  try {
    const response = await api.get<TagInfo[]>('/tags');
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Languages
export const getLanguages = async (): Promise<LanguageInfo[]> => {
  try {
    const response = await api.get<LanguageInfo[]>('/languages');
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Categories
export const getCategories = async (): Promise<CategoryInfo[]> => {
  try {
    const response = await api.get<CategoryInfo[]>('/categories');
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Frameworks
export const getFrameworks = async (): Promise<FrameworkInfo[]> => {
  try {
    const response = await api.get<FrameworkInfo[]>('/frameworks');
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Stats
export const getStats = async (): Promise<Stats> => {
  try {
    const response = await api.get<Stats>('/stats');
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Export
export const exportSnippets = async (): Promise<ExportData> => {
  try {
    const response = await api.get<ExportData>('/export');
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

// Import
export const importSnippets = async (snippets: Snippet[], overwrite: boolean = false): Promise<ImportResult> => {
  try {
    const response = await api.post<ImportResult>('/import', { snippets, overwrite });
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};