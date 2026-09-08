const crypto = require('node:crypto');
const { getDatabase, saveDatabase } = require('../config/database');

function generateEventQrSecret(eventId) {
  const nonce = crypto.randomBytes(6).toString('hex');
  return `GEOATTEND_${eventId.toUpperCase()}_${Date.now()}_${nonce}`;
}

// GET /api/events
function getAllEvents(req, res) {
  try {
    const db = getDatabase();
    const { category, search, organizerId } = req.query;

    let events = [...db.events];

    if (category && category !== 'ALL') {
      events = events.filter(e => e.category.toLowerCase() === category.toLowerCase());
    }

    if (organizerId) {
      events = events.filter(e => e.organizerId === organizerId);
    }

    if (search) {
      const q = search.toLowerCase();
      events = events.filter(e =>
        e.title.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
      );
    }

    // Attach real-time attendee statistics to each event
    const eventsWithStats = events.map(e => {
      const attendees = (db.attendances || []).filter(a => a.eventId === e.id);
      const verifiedCount = attendees.filter(a => a.status === 'VERIFIED').length;
      const flaggedCount = attendees.filter(a => a.status === 'OUT_OF_BOUNDS').length;
      const capacity = e.capacity || 100;
      const percentage = Math.round((verifiedCount / capacity) * 100);

      return {
        ...e,
        stats: {
          totalAttendees: attendees.length,
          verifiedCount,
          flaggedCount,
          attendancePercentage: Math.min(percentage, 100)
        }
      };
    });

    return res.json({
      success: true,
      count: eventsWithStats.length,
      events: eventsWithStats
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// GET /api/events/:id
function getEventById(req, res) {
  try {
    const db = getDatabase();
    const event = db.events.find(e => e.id === req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const attendees = (db.attendances || []).filter(a => a.eventId === event.id);
    const verifiedCount = attendees.filter(a => a.status === 'VERIFIED').length;
    const capacity = event.capacity || 100;
    const percentage = Math.round((verifiedCount / capacity) * 100);

    return res.json({
      success: true,
      event: {
        ...event,
        stats: {
          totalAttendees: attendees.length,
          verifiedCount,
          attendancePercentage: Math.min(percentage, 100)
        }
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// POST /api/events
function createEvent(req, res) {
  try {
    const {
      title,
      description,
      venue,
      lat,
      lng,
      geofenceRadius,
      date,
      startTime,
      endTime,
      capacity,
      category,
      bannerUrl
    } = req.body;

    if (!title || !venue || lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Title, venue, latitude, and longitude are required.'
      });
    }

    const db = getDatabase();
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const qrSecret = generateEventQrSecret(eventId);

    const newEvent = {
      id: eventId,
      organizerId: req.user ? req.user.id : 'usr_org_01',
      organizerName: req.user ? req.user.name : 'Lead Organizer',
      title: title.trim(),
      description: description ? description.trim() : 'Event organized on GeoAttend.',
      venue: venue.trim(),
      lat: Number.parseFloat(lat),
      lng: Number.parseFloat(lng),
      geofenceRadius: Number(geofenceRadius) || 100, // Default 100m
      date: date || new Date().toISOString().split('T')[0],
      startTime: startTime || '09:00',
      endTime: endTime || '17:00',
      capacity: Number(capacity) || 150,
      category: category || 'Workshop',
      status: 'active',
      qrSecret,
      bannerUrl: bannerUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString()
    };

    db.events.unshift(newEvent);
    saveDatabase(db);

    return res.status(201).json({
      success: true,
      message: 'Event created successfully with geofenced boundaries.',
      event: newEvent
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// PUT /api/events/:id
function updateEvent(req, res) {
  try {
    const db = getDatabase();
    const eventIndex = db.events.findIndex(e => e.id === req.params.id);

    if (eventIndex === -1) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const currentEvent = db.events[eventIndex];

    // Check authorization: organizer can only edit their own event, unless admin
    if (req.user && req.user.role !== 'admin' && currentEvent.organizerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this event.'
      });
    }

    const updates = req.body;
    const updatedEvent = {
      ...currentEvent,
      ...updates,
      lat: updates.lat !== undefined ? Number.parseFloat(updates.lat) : currentEvent.lat,
      lng: updates.lng !== undefined ? Number.parseFloat(updates.lng) : currentEvent.lng,
      geofenceRadius: updates.geofenceRadius !== undefined ? Number(updates.geofenceRadius) : currentEvent.geofenceRadius,
      capacity: updates.capacity !== undefined ? Number(updates.capacity) : currentEvent.capacity,
      updatedAt: new Date().toISOString()
    };

    db.events[eventIndex] = updatedEvent;
    saveDatabase(db);

    return res.json({
      success: true,
      message: 'Event updated successfully.',
      event: updatedEvent
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// DELETE /api/events/:id
function deleteEvent(req, res) {
  try {
    const db = getDatabase();
    const eventIndex = db.events.findIndex(e => e.id === req.params.id);

    if (eventIndex === -1) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const currentEvent = db.events[eventIndex];

    // Check authorization
    if (req.user && req.user.role !== 'admin' && currentEvent.organizerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this event.'
      });
    }

    db.events.splice(eventIndex, 1);
    // Also remove associated attendance records
    db.attendances = (db.attendances || []).filter(a => a.eventId !== req.params.id);
    saveDatabase(db);

    return res.json({
      success: true,
      message: 'Event and related attendance records deleted successfully.'
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// POST /api/events/:id/regenerate-qr
function regenerateQrSecret(req, res) {
  try {
    const db = getDatabase();
    const event = db.events.find(e => e.id === req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const newSecret = generateEventQrSecret(event.id);
    event.qrSecret = newSecret;
    event.qrRegeneratedAt = new Date().toISOString();

    saveDatabase(db);

    return res.json({
      success: true,
      message: 'Dynamic QR token refreshed successfully.',
      qrSecret: newSecret
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  regenerateQrSecret
};
