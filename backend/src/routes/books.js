const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/', bookController.getBooks);
router.get('/:bookId', bookController.getBookById);
router.post('/', bookController.createBook);
router.put('/:bookId', bookController.updateBook);
router.delete('/:bookId', authenticateToken, requireAdmin, bookController.deleteBook);
router.get('/:bookId/qr', bookController.getBookQR);

module.exports = router;

