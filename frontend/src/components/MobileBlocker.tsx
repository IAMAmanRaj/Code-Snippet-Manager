import React from 'react';
import { FiMonitor, FiCode } from 'react-icons/fi';

export const MobileBlocker: React.FC = () => {
  return (
    <div className="mobile-blocker">
      <div 
        className="p-4 rounded-2xl mb-6"
        style={{ backgroundColor: 'var(--color-brand-light)' }}
      >
        <FiCode size={48} style={{ color: 'var(--color-brand-primary)' }} />
      </div>
      
      <h1 
        className="text-2xl font-bold mb-3"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Desktop Only
      </h1>
      
      <p 
        className="text-base mb-6 max-w-sm"
        style={{ color: 'var(--color-text-tertiary)' }}
      >
        Snippet Manager is designed for desktop use. Please access this application on a device with a screen width of at least 768px for the best experience.
      </p>
      
      <div 
        className="flex items-center gap-2 px-4 py-2 rounded-lg"
        style={{ 
          backgroundColor: 'var(--color-bg-tertiary)',
          color: 'var(--color-text-secondary)'
        }}
      >
        <FiMonitor size={20} />
        <span className="text-sm font-medium">Minimum width: 768px</span>
      </div>
    </div>
  );
};