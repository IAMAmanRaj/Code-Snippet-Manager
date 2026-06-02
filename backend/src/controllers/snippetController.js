const Snippet = require('../models/Snippet');

// Error handler helper
const handleError = (res, error, defaultMessage = 'An error occurred', statusCode = 500) => {
  console.error(`${defaultMessage}:`, error.message || error);
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack:', error.stack);
  }
  
  // Check if response already sent
  if (res.headersSent) {
    console.error('Headers already sent, cannot send error response');
    return;
  }
  
  // Handle specific MongoDB errors
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors || {}).map(e => e.message);
    return res.status(400).json({ 
      message: 'Validation failed', 
      errors: messages,
      error: messages.join(', ') || error.message
    });
  }
  
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return res.status(400).json({ 
      message: 'Invalid ID format',
      error: 'The provided ID is not valid'
    });
  }
  
  if (error.code === 11000) {
    return res.status(409).json({ 
      message: 'Duplicate entry',
      error: 'An item with this data already exists'
    });
  }

  // Handle MongoDB connection errors
  if (error.name === 'MongoNetworkError' || error.name === 'MongooseServerSelectionError') {
    return res.status(503).json({
      message: 'Database unavailable',
      error: 'Unable to connect to the database. Please try again later.'
    });
  }

  return res.status(statusCode).json({ 
    message: defaultMessage, 
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
};

// Get all snippets with filtering and search
exports.getSnippets = async (req, res) => {
  try {
    const { 
      search, 
      type, 
      language,
      category,
      framework,
      platform, 
      tags, 
      favorite,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 50
    } = req.query;

    let query = {};

    // Text search - use regex fallback if text index fails
    if (search) {
      // Use regex search for better compatibility
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { content: searchRegex },
        { tags: searchRegex }
      ];
    }

    // Type filter
    if (type && ['snippet', 'command'].includes(type)) {
      query.type = type;
    }

    // Language filter
    if (language) {
      query.language = language.toLowerCase();
    }

    // Category filter
    if (category) {
      query.category = category.toLowerCase();
    }

    // Framework filter
    if (framework) {
      query.framework = framework.toLowerCase();
    }

    // Platform filter
    if (platform && ['windows', 'linux', 'mac', 'all', 'na'].includes(platform)) {
      query.platform = platform;
    }

    // Tags filter (comma-separated)
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim().toLowerCase());
      query.tags = { $all: tagArray };
    }

    // Favorite filter
    if (favorite === 'true') {
      query.isFavorite = true;
    }

    // Validate sort field to prevent injection
    const allowedSortFields = ['createdAt', 'updatedAt', 'title', 'accessCount', 'lastAccessedAt'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    
    const sortOptions = {};
    sortOptions[safeSortBy] = sortOrder === 'asc' ? 1 : -1;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [snippets, total] = await Promise.all([
      Snippet.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Snippet.countDocuments(query)
    ]);

    res.json({
      snippets,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    handleError(res, error, 'Error fetching snippets');
  }
};

// Get recent snippets
exports.getRecentSnippets = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
    
    const snippets = await Snippet.find({ lastAccessedAt: { $ne: null } })
      .sort({ lastAccessedAt: -1 })
      .limit(limitNum)
      .lean();

    res.json(snippets);
  } catch (error) {
    handleError(res, error, 'Error fetching recent snippets');
  }
};

// Get favorite snippets
exports.getFavoriteSnippets = async (req, res) => {
  try {
    const snippets = await Snippet.find({ isFavorite: true })
      .sort({ createdAt: -1 })
      .lean();

    res.json(snippets);
  } catch (error) {
    handleError(res, error, 'Error fetching favorites');
  }
};

// Get single snippet
exports.getSnippet = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid snippet ID format' });
    }

    const snippet = await Snippet.findById(id);
    
    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    // Update access tracking
    snippet.accessCount += 1;
    snippet.lastAccessedAt = new Date();
    await snippet.save();

    res.json(snippet);
  } catch (error) {
    handleError(res, error, 'Error fetching snippet');
  }
};

// Create snippet
exports.createSnippet = async (req, res) => {
  try {
    const { title, content, description, type, language, category, framework, platform, tags, isFavorite } = req.body;

    // Validate required fields
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Validation failed', error: 'Title is required' });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'Validation failed', error: 'Content is required' });
    }

    const snippetData = {
      title: title.trim(),
      content: content,
      description: description?.trim() || '',
      type: type || 'snippet',
      language: language?.toLowerCase() || 'plaintext',
      category: category?.toLowerCase() || 'general',
      framework: framework?.toLowerCase() || 'none',
      platform: type === 'command' ? (platform || 'all') : 'na',
      tags: Array.isArray(tags) ? tags.map(t => t.trim().toLowerCase()).filter(Boolean) : [],
      isFavorite: Boolean(isFavorite)
    };

    const snippet = new Snippet(snippetData);
    await snippet.save();
    
    res.status(201).json(snippet);
  } catch (error) {
    handleError(res, error, 'Error creating snippet', 400);
  }
};

// Update snippet
exports.updateSnippet = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid snippet ID format' });
    }

    const { title, content, description, type, language, category, framework, platform, tags, isFavorite } = req.body;

    const snippet = await Snippet.findById(id);
    
    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    // Update fields if provided
    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ message: 'Validation failed', error: 'Title cannot be empty' });
      }
      snippet.title = title.trim();
    }
    if (content !== undefined) {
      if (!content.trim()) {
        return res.status(400).json({ message: 'Validation failed', error: 'Content cannot be empty' });
      }
      snippet.content = content;
    }
    if (description !== undefined) snippet.description = description.trim();
    if (type !== undefined) snippet.type = type;
    if (language !== undefined) snippet.language = language.toLowerCase();
    if (category !== undefined) snippet.category = category.toLowerCase();
    if (framework !== undefined) snippet.framework = framework.toLowerCase();
    if (platform !== undefined) snippet.platform = (snippet.type === 'command' || type === 'command') ? platform : 'na';
    if (tags !== undefined) snippet.tags = Array.isArray(tags) ? tags.map(t => t.trim().toLowerCase()).filter(Boolean) : [];
    if (isFavorite !== undefined) snippet.isFavorite = Boolean(isFavorite);

    await snippet.save();
    res.json(snippet);
  } catch (error) {
    handleError(res, error, 'Error updating snippet', 400);
  }
};

// Delete snippet
exports.deleteSnippet = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid snippet ID format' });
    }

    const snippet = await Snippet.findByIdAndDelete(id);
    
    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    res.json({ message: 'Snippet deleted successfully', id: snippet._id });
  } catch (error) {
    handleError(res, error, 'Error deleting snippet');
  }
};

// Toggle favorite
exports.toggleFavorite = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid snippet ID format' });
    }

    const snippet = await Snippet.findById(id);
    
    if (!snippet) {
      return res.status(404).json({ message: 'Snippet not found' });
    }

    snippet.isFavorite = !snippet.isFavorite;
    await snippet.save();

    res.json(snippet);
  } catch (error) {
    handleError(res, error, 'Error toggling favorite');
  }
};

// Get all tags
exports.getTags = async (req, res) => {
  try {
    const tags = await Snippet.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 100 },
      { $project: { tag: '$_id', count: 1, _id: 0 } }
    ]);

    res.json(tags);
  } catch (error) {
    handleError(res, error, 'Error fetching tags');
  }
};

// Get all languages
exports.getLanguages = async (req, res) => {
  try {
    const languages = await Snippet.aggregate([
      { $group: { _id: '$language', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { language: '$_id', count: 1, _id: 0 } }
    ]);

    res.json(languages);
  } catch (error) {
    handleError(res, error, 'Error fetching languages');
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Snippet.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { category: '$_id', count: 1, _id: 0 } }
    ]);

    res.json(categories);
  } catch (error) {
    handleError(res, error, 'Error fetching categories');
  }
};

// Get all frameworks
exports.getFrameworks = async (req, res) => {
  try {
    const frameworks = await Snippet.aggregate([
      { $match: { framework: { $ne: 'none' } } },
      { $group: { _id: '$framework', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { framework: '$_id', count: 1, _id: 0 } }
    ]);

    res.json(frameworks);
  } catch (error) {
    handleError(res, error, 'Error fetching frameworks');
  }
};

// Export all snippets
exports.exportSnippets = async (req, res) => {
  try {
    const snippets = await Snippet.find({}).lean();
    
    res.json({
      exportDate: new Date().toISOString(),
      version: '1.1',
      count: snippets.length,
      snippets
    });
  } catch (error) {
    handleError(res, error, 'Error exporting snippets');
  }
};

// Import snippets
exports.importSnippets = async (req, res) => {
  try {
    const { snippets, overwrite = false } = req.body;

    if (!snippets) {
      return res.status(400).json({ message: 'Invalid import data', error: 'No snippets provided' });
    }

    if (!Array.isArray(snippets)) {
      return res.status(400).json({ message: 'Invalid import data', error: 'Snippets must be an array' });
    }

    if (snippets.length === 0) {
      return res.status(400).json({ message: 'Invalid import data', error: 'Snippets array is empty' });
    }

    let imported = 0;
    let skipped = 0;
    let errors = 0;
    const errorDetails = [];

    for (let i = 0; i < snippets.length; i++) {
      const item = snippets[i];
      try {
        // Remove MongoDB specific fields
        const { _id, __v, createdAt, updatedAt, accessCount, lastAccessedAt, ...snippetData } = item;

        // Validate required fields
        if (!snippetData.title || !snippetData.title.trim()) {
          skipped++;
          errorDetails.push(`Item ${i + 1}: Missing title`);
          continue;
        }
        if (!snippetData.content || !snippetData.content.trim()) {
          skipped++;
          errorDetails.push(`Item ${i + 1}: Missing content`);
          continue;
        }

        // Normalize data
        snippetData.title = snippetData.title.trim();
        snippetData.language = snippetData.language?.toLowerCase() || 'plaintext';
        snippetData.category = snippetData.category?.toLowerCase() || 'general';
        snippetData.framework = snippetData.framework?.toLowerCase() || 'none';
        snippetData.tags = Array.isArray(snippetData.tags) 
          ? snippetData.tags.map(t => t.trim().toLowerCase()).filter(Boolean) 
          : [];

        // Check for existing snippet with same title
        const existing = await Snippet.findOne({ title: snippetData.title });

        if (existing) {
          if (overwrite) {
            await Snippet.findByIdAndUpdate(existing._id, snippetData);
            imported++;
          } else {
            skipped++;
          }
        } else {
          await Snippet.create(snippetData);
          imported++;
        }
      } catch (err) {
        errors++;
        errorDetails.push(`Item ${i + 1}: ${err.message}`);
      }
    }

    res.json({
      message: 'Import completed',
      imported,
      skipped,
      errors,
      total: snippets.length,
      errorDetails: errorDetails.length > 0 ? errorDetails.slice(0, 10) : undefined
    });
  } catch (error) {
    handleError(res, error, 'Error importing snippets');
  }
};

// Get statistics
exports.getStats = async (req, res) => {
  try {
    const [
      totalSnippets,
      totalCommands,
      totalFavorites,
      typeStats,
      languageStats,
      categoryStats,
      frameworkStats,
      platformStats
    ] = await Promise.all([
      Snippet.countDocuments({ type: 'snippet' }),
      Snippet.countDocuments({ type: 'command' }),
      Snippet.countDocuments({ isFavorite: true }),
      Snippet.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]),
      Snippet.aggregate([
        { $group: { _id: '$language', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 15 }
      ]),
      Snippet.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Snippet.aggregate([
        { $match: { framework: { $ne: 'none' } } },
        { $group: { _id: '$framework', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Snippet.aggregate([
        { $match: { type: 'command' } },
        { $group: { _id: '$platform', count: { $sum: 1 } } }
      ])
    ]);

    res.json({
      totalSnippets,
      totalCommands,
      totalFavorites,
      total: totalSnippets + totalCommands,
      typeStats,
      languageStats,
      categoryStats,
      frameworkStats,
      platformStats
    });
  } catch (error) {
    handleError(res, error, 'Error fetching stats');
  }
};