const express = require('express');
const router = express.Router();
const {
  verifyAndMarkAttendance,
  getEventAttendance,
  getLiveAttendanceStats,
  manualCheckin,
  getMyAttendanceHistory
} = require('../controllers/attendanceController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Public/Attendee route (allows auth or guest check-in)
router.post('/verify-and-mark', (req, res, next) => {
  // Optional auth token checking
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    return authenticateToken(req, res, () => verifyAndMarkAttendance(req, res));
  }
  return verifyAndMarkAttendance(req, res);
});

router.get('/event/:eventId', getEventAttendance);
router.get('/live/:eventId', getLiveAttendanceStats);
router.post('/manual-checkin', authenticateToken, requireRole(['organizer', 'admin']), manualCheckin);
router.get('/my-history', authenticateToken, getMyAttendanceHistory);

module.exports = router;
