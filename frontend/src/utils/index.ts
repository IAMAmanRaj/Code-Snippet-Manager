import { format, formatDistanceToNow } from 'date-fns';

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (e) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

export const formatDate = (date: string | null): string => {
  if (!date) return 'Never';
  return format(new Date(date), 'MMM d, yyyy HH:mm');
};

export const formatRelativeDate = (date: string | null): string => {
  if (!date) return 'Never';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const downloadJSON = (data: object, filename: string): void => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const parseJSONFile = (file: File): Promise<unknown> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (err) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Common programming languages for the dropdown
export const LANGUAGES = [
  'plaintext',
  'javascript',
  'typescript',
  'python',
  'java',
  'csharp',
  'cpp',
  'c',
  'go',
  'rust',
  'ruby',
  'php',
  'swift',
  'kotlin',
  'scala',
  'html',
  'css',
  'scss',
  'less',
  'json',
  'yaml',
  'xml',
  'markdown',
  'sql',
  'shell',
  'bash',
  'powershell',
  'dockerfile',
  'graphql',
  'lua',
  'perl',
  'r',
  'matlab',
  'julia',
];

// Map language names to Monaco/Prism language identifiers
export const getMonacoLanguage = (lang: string): string => {
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'py': 'python',
    'rb': 'ruby',
    'cs': 'csharp',
    'cpp': 'cpp',
    'c++': 'cpp',
    'bash': 'shell',
    'sh': 'shell',
    'zsh': 'shell',
    'yml': 'yaml',
    'md': 'markdown',
  };
  return languageMap[lang.toLowerCase()] || lang.toLowerCase();
};

export const getPrismLanguage = (lang: string): string => {
  const languageMap: Record<string, string> = {
    'shell': 'bash',
    'sh': 'bash',
    'zsh': 'bash',
    'powershell': 'powershell',
    'ps1': 'powershell',
    'csharp': 'csharp',
    'cs': 'csharp',
    'cpp': 'cpp',
    'c++': 'cpp',
  };
  return languageMap[lang.toLowerCase()] || lang.toLowerCase();
};

export const getPlatformLabel = (platform: string): string => {
  const labels: Record<string, string> = {
    'windows': 'Windows',
    'linux': 'Linux',
    'mac': 'macOS',
    'all': 'All Platforms',
    'na': 'N/A',
  };
  return labels[platform] || platform;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};