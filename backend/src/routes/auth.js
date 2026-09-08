const express = require('express');
const router = express.Router();
const { register, login, demoLogin, getMe, getAllUsers } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/demo-login', demoLogin);
router.get('/me', authenticateToken, getMe);
router.get('/users', getAllUsers);

module.exports = router;
