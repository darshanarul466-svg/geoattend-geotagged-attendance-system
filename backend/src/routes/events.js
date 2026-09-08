const express = require('express');
const router = express.Router();
const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  regenerateQrSecret
} = require('../controllers/eventController');
const { authenticateToken, requireRole } = require('../middleware/auth');

router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.post('/', authenticateToken, requireRole(['organizer', 'admin']), createEvent);
router.put('/:id', authenticateToken, requireRole(['organizer', 'admin']), updateEvent);
router.delete('/:id', authenticateToken, requireRole(['organizer', 'admin']), deleteEvent);
router.post('/:id/regenerate-qr', authenticateToken, requireRole(['organizer', 'admin']), regenerateQrSecret);

module.exports = router;
