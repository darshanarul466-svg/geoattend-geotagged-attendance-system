const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/me', authenticateToken, authController.getMe);
router.get('/users', authenticateToken, requireAdmin, authController.getUsers);
router.patch('/users/:id/role', authenticateToken, requireAdmin, authController.updateUserRole);

module.exports = router;

