const crypto = require('node:crypto');
const { getDatabase, saveDatabase } = require('../config/database');
const { verifyGeofence, formatDistance } = require('../utils/haversine');

// POST /api/attendance/verify-and-mark
function verifyAndMarkAttendance(req, res) {
  try {
    const { eventId, qrData, userLat, userLng, accuracy } = req.body;

    if (!eventId) {
      return res.status(400).json({ success: false, message: 'Event ID is required.' });
    }

    if (userLat === undefined || userLng === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Geolocation coordinates (latitude and longitude) are required for verification.'
      });
    }

    const db = getDatabase();
    const event = db.events.find(e => e.id === eventId);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Target event not found.' });
    }

    // 1. QR Code Verification
    if (qrData) {
      let extractedToken = qrData.trim();
      // Support structured format GEOATTEND:EVENT:<id>:<token> or raw token
      if (extractedToken.includes(':')) {
        const parts = extractedToken.split(':');
        extractedToken = parts[parts.length - 1];
      }

      // Check if matches event QR secret or event ID
      const matchesSecret = event.qrSecret && (extractedToken === event.qrSecret || extractedToken.includes(event.id));
      const matchesEventId = extractedToken === event.id;

      if (!matchesSecret && !matchesEventId) {
        return res.status(400).json({
          success: false,
          code: 'QR_INVALID',
          message: 'Invalid or expired QR code for this event. Please scan the current active QR code.'
        });
      }
    }

    // 2. Geolocation Haversine Distance Verification
    const geofenceResult = verifyGeofence(
      { lat: Number.parseFloat(userLat), lng: Number.parseFloat(userLng) },
      { lat: event.lat, lng: event.lng },
      event.geofenceRadius
    );

    const { isWithin, distanceMeters, allowedRadius } = geofenceResult;

    if (!isWithin) {
      return res.status(403).json({
        success: false,
        code: 'OUT_OF_BOUNDS',
        message: `Geofence breach: You are ${formatDistance(distanceMeters)} away from ${event.venue}. The allowed geofence perimeter is ${allowedRadius} meters.`,
        details: {
          distanceMeters,
          allowedRadius,
          venueName: event.venue,
          venueCoords: { lat: event.lat, lng: event.lng },
          userCoords: { lat: Number.parseFloat(userLat), lng: Number.parseFloat(userLng) }
        }
      });
    }

    // 3. User Identity & Duplicate Check
    const userId = req.user ? req.user.id : (req.body.userId || 'usr_guest_demo');
    const userName = req.user ? req.user.name : (req.body.userName || 'Verified Attendee');
    const userEmail = req.user ? req.user.email : (req.body.userEmail || 'attendee@example.com');
    const userRegId = req.user ? req.user.regId : (req.body.userRegId || 'REG-GUEST');
    const userDepartment = req.user ? req.user.department : (req.body.userDepartment || 'General');

    // Prevent duplicate attendance submissions for the same user and event
    const existing = (db.attendances || []).find(
      a => a.eventId === eventId && (a.userId === userId || (userEmail && a.userEmail === userEmail))
    );

    if (existing) {
      return res.status(409).json({
        success: false,
        code: 'DUPLICATE_ATTENDANCE',
        message: 'Attendance has already been recorded for this event.',
        existingRecord: {
          id: existing.id,
          timestamp: existing.timestamp,
          status: existing.status,
          distanceMeters: existing.distanceMeters
        }
      });
    }

    // 4. Record Attendance
    const attendanceId = `att_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const timestamp = new Date().toISOString();

    const attendanceRecord = {
      id: attendanceId,
      eventId: event.id,
      eventTitle: event.title,
      venue: event.venue,
      userId,
      userName,
      userEmail,
      userRegId,
      userDepartment,
      timestamp,
      userLocation: {
        lat: Number.parseFloat(userLat),
        lng: Number.parseFloat(userLng),
        accuracy: accuracy ? Number.parseFloat(accuracy) : null
      },
      distanceMeters,
      allowedRadius,
      status: 'VERIFIED',
      verificationMethod: 'QR_AND_GEO',
      verifiedAt: timestamp,
      verificationHash: crypto.createHash('sha256').update(`${attendanceId}:${eventId}:${userId}:${timestamp}`).digest('hex').substring(0, 16)
    };

    if (!db.attendances) db.attendances = [];
    db.attendances.unshift(attendanceRecord);
    saveDatabase(db);

    return res.status(201).json({
      success: true,
      message: `Attendance confirmed! You are ${formatDistance(distanceMeters)} from ${event.venue}.`,
      attendance: attendanceRecord
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// GET /api/attendance/event/:eventId
function getEventAttendance(req, res) {
  try {
    const { eventId } = req.params;
    const { search, status } = req.query;

    const db = getDatabase();
    let records = (db.attendances || []).filter(a => a.eventId === eventId);

    if (status && status !== 'ALL') {
      records = records.filter(a => a.status === status);
    }

    if (search) {
      const q = search.toLowerCase();
      records = records.filter(a =>
        (a.userName && a.userName.toLowerCase().includes(q)) ||
        (a.userEmail && a.userEmail.toLowerCase().includes(q)) ||
        (a.userRegId && a.userRegId.toLowerCase().includes(q)) ||
        (a.userDepartment && a.userDepartment.toLowerCase().includes(q))
      );
    }

    return res.json({
      success: true,
      count: records.length,
      records
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// GET /api/attendance/live/:eventId
// Brownie subtask ⭐ Real-time attendance tracking for organizers
function getLiveAttendanceStats(req, res) {
  try {
    const { eventId } = req.params;
    const db = getDatabase();
    const event = db.events.find(e => e.id === eventId);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const eventAttendances = (db.attendances || []).filter(a => a.eventId === eventId);
    const verifiedCount = eventAttendances.filter(a => a.status === 'VERIFIED').length;
    const flaggedCount = eventAttendances.filter(a => a.status === 'OUT_OF_BOUNDS').length;
    const totalCapacity = event.capacity || 150;
    const attendancePercentage = Math.min(Math.round((verifiedCount / totalCapacity) * 100), 100);

    // Recent 8 check-ins
    const recentActivity = eventAttendances.slice(0, 8).map(a => ({
      id: a.id,
      name: a.userName,
      regId: a.userRegId,
      department: a.userDepartment,
      timestamp: a.timestamp,
      distanceMeters: a.distanceMeters,
      status: a.status
    }));

    return res.json({
      success: true,
      eventId: event.id,
      eventTitle: event.title,
      venue: event.venue,
      geofenceRadius: event.geofenceRadius,
      stats: {
        totalRegistered: totalCapacity,
        totalAttendees: eventAttendances.length,
        verifiedCount,
        flaggedCount,
        attendancePercentage,
        capacityRemaining: Math.max(0, totalCapacity - verifiedCount)
      },
      recentActivity,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// POST /api/attendance/manual-checkin
// Organizer override for attendance marking
function manualCheckin(req, res) {
  try {
    const { eventId, userRegId, userName, userEmail, userDepartment, notes } = req.body;

    if (!eventId || !userName) {
      return res.status(400).json({ success: false, message: 'Event ID and Attendee Name are required.' });
    }

    const db = getDatabase();
    const event = db.events.find(e => e.id === eventId);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    const attendanceId = `att_manual_${Date.now()}`;
    const timestamp = new Date().toISOString();

    const record = {
      id: attendanceId,
      eventId: event.id,
      eventTitle: event.title,
      venue: event.venue,
      userId: `usr_manual_${Date.now()}`,
      userName: userName.trim(),
      userEmail: userEmail ? userEmail.trim() : 'manual.entry@geoattend.io',
      userRegId: userRegId ? userRegId.trim() : `MAN-${Math.floor(1000 + Math.random() * 9000)}`,
      userDepartment: userDepartment || 'General',
      timestamp,
      distanceMeters: 0,
      allowedRadius: event.geofenceRadius,
      status: 'VERIFIED',
      verificationMethod: 'MANUAL_ORGANIZER_OVERRIDE',
      verifiedAt: timestamp,
      organizerNotes: notes || 'Manual check-in granted by organizer'
    };

    if (!db.attendances) db.attendances = [];
    db.attendances.unshift(record);
    saveDatabase(db);

    return res.status(201).json({
      success: true,
      message: `Manual attendance recorded for ${userName}.`,
      attendance: record
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

// GET /api/attendance/my-history
function getMyAttendanceHistory(req, res) {
  try {
    const db = getDatabase();
    const userId = req.user ? req.user.id : null;
    const userEmail = req.user ? req.user.email : null;

    let myRecords = [];
    if (userId || userEmail) {
      myRecords = (db.attendances || []).filter(
        a => (userId && a.userId === userId) || (userEmail && a.userEmail === userEmail)
      );
    }

    return res.json({
      success: true,
      count: myRecords.length,
      records: myRecords
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

module.exports = {
  verifyAndMarkAttendance,
  getEventAttendance,
  getLiveAttendanceStats,
  manualCheckin,
  getMyAttendanceHistory
};
