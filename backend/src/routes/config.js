const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { getDatabase, saveDatabase } = require('../config/database');

// GET /api/config/status
router.get('/status', (req, res) => {
  try {
    const db = getDatabase();
    const config = db.systemConfig || null;
    return res.json({
      success: true,
      isConfigured: !!(config && config.isConfigured),
      config: config || {
        institutionName: 'Campus Attendance System',
        venueName: 'Grand Central Auditorium',
        lat: 12.9716,
        lng: 77.5946,
        geofenceRadius: 100,
        accuracyRating: 8
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/config/setup
router.post('/setup', async (req, res) => {
  try {
    const {
      institutionName,
      venueName,
      lat,
      lng,
      geofenceRadius,
      accuracyRating,
      adminName,
      adminEmail,
      adminPassword
    } = req.body;

    if (!venueName || lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Venue name, latitude, and longitude coordinates are required.'
      });
    }

    const db = getDatabase();

    // 1. Save system configuration
    db.systemConfig = {
      isConfigured: true,
      institutionName: institutionName ? institutionName.trim() : 'Campus Attendance System',
      venueName: venueName.trim(),
      lat: Number.parseFloat(lat),
      lng: Number.parseFloat(lng),
      geofenceRadius: Number(geofenceRadius) || 100,
      accuracyRating: Number(accuracyRating) || 8,
      configuredAt: new Date().toISOString()
    };

    // 2. Create or update master admin if credentials provided
    if (adminEmail && adminPassword) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adminPassword, salt);
      const adminUser = {
        id: 'usr_admin_master',
        name: adminName ? adminName.trim() : 'System Administrator',
        email: adminEmail.trim().toLowerCase(),
        password: hashedPassword,
        role: 'organizer',
        regId: 'ADM-MASTER',
        department: 'Administration',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        createdAt: new Date().toISOString()
      };

      // Replace or add
      const existingIdx = db.users.findIndex(u => u.email.toLowerCase() === adminUser.email);
      if (existingIdx !== -1) {
        db.users[existingIdx] = adminUser;
      } else {
        db.users.unshift(adminUser);
      }
    }

    // 3. Update or create the primary default event with these exact coordinates
    if (db.events && db.events.length > 0) {
      db.events[0].venue = venueName.trim();
      db.events[0].lat = Number.parseFloat(lat);
      db.events[0].lng = Number.parseFloat(lng);
      db.events[0].geofenceRadius = Number(geofenceRadius) || 100;
    }

    saveDatabase(db);

    return res.status(200).json({
      success: true,
      message: 'One-time system setup completed successfully.',
      config: db.systemConfig
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
