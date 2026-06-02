const mongoose = require('mongoose');

const snippetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: ''
  },
  type: {
    type: String,
    enum: ['snippet', 'command'],
    required: [true, 'Type is required'],
    default: 'snippet'
  },
  language: {
    type: String,
    trim: true,
    default: 'plaintext'
  },
  // Categories for better organization (especially for React/Frontend)
  category: {
    type: String,
    trim: true,
    default: 'general',
    enum: [
      'general',
      'component',
      'hook',
      'utility',
      'api',
      'style',
      'config',
      'test',
      'type',
      'context',
      'redux',
      'form',
      'animation',
      'layout',
      'navigation',
      'auth',
      'data-fetching',
      'error-handling',
      'performance',
      'accessibility',
      'other'
    ]
  },
  framework: {
    type: String,
    trim: true,
    default: 'none',
    enum: [
      'none',
      'react',
      'nextjs',
      'vue',
      'angular',
      'svelte',
      'express',
      'nestjs',
      'fastapi',
      'django',
      'flask',
      'spring',
      'other'
    ]
  },
  platform: {
    type: String,
    enum: ['windows', 'linux', 'mac', 'all', 'na'],
    default: 'na'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isFavorite: {
    type: Boolean,
    default: false
  },
  accessCount: {
    type: Number,
    default: 0
  },
  lastAccessedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Text index for search - use language_override to avoid conflict with MongoDB's internal language field
snippetSchema.index(
  { 
    title: 'text', 
    content: 'text', 
    description: 'text',
    tags: 'text' 
  },
  {
    // This tells MongoDB to use 'textSearchLanguage' field instead of 'language' for text search
    language_override: 'textSearchLanguage',
    // Weights for search relevance
    weights: {
      title: 10,
      tags: 5,
      description: 3,
      content: 1
    }
  }
);

// Regular indexes
snippetSchema.index({ type: 1 });
snippetSchema.index({ language: 1 });
snippetSchema.index({ category: 1 });
snippetSchema.index({ framework: 1 });
snippetSchema.index({ platform: 1 });
snippetSchema.index({ isFavorite: 1 });
snippetSchema.index({ createdAt: -1 });
snippetSchema.index({ lastAccessedAt: -1 });
snippetSchema.index({ tags: 1 });

module.exports = mongoose.model('Snippet', snippetSchema);