const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.use(optionalAuth);

router.post('/verify-qr', transactionController.verifyScannedBook);
router.post('/issue', transactionController.issueBook);
router.post('/return', transactionController.returnBook);
router.get('/', transactionController.getTransactions);
router.get('/active', transactionController.getActiveLoans);

module.exports = router;

