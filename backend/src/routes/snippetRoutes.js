const express = require('express');
const router = express.Router();
const snippetController = require('../controllers/snippetController');

// Get all snippets with filters
router.get('/', snippetController.getSnippets);

// Get recent snippets
router.get('/recent', snippetController.getRecentSnippets);

// Get favorite snippets
router.get('/favorites', snippetController.getFavoriteSnippets);

// Get all tags
router.get('/tags', snippetController.getTags);

// Get all languages
router.get('/languages', snippetController.getLanguages);

// Get all categories
router.get('/categories', snippetController.getCategories);

// Get all frameworks
router.get('/frameworks', snippetController.getFrameworks);

// Get statistics
router.get('/stats', snippetController.getStats);

// Export all snippets
router.get('/export', snippetController.exportSnippets);

// Import snippets
router.post('/import', snippetController.importSnippets);

// Get single snippet
router.get('/:id', snippetController.getSnippet);

// Create snippet
router.post('/', snippetController.createSnippet);

// Update snippet
router.put('/:id', snippetController.updateSnippet);

// Delete snippet
router.delete('/:id', snippetController.deleteSnippet);

// Toggle favorite
router.patch('/:id/favorite', snippetController.toggleFavorite);

module.exports = router;