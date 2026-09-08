const express = require('express');
const router = express.Router();
const { exportCsv, exportExcel } = require('../controllers/exportController');

router.get('/csv/:eventId', exportCsv);
router.get('/excel/:eventId', exportExcel);

module.exports = router;
