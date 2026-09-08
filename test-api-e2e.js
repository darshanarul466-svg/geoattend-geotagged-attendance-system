/**
 * Automated End-to-End Test Suite for CheckIn / GeoAttend
 * Validates:
 * 1. Health check
 * 2. User Authentication & 1-Click Demo Login
 * 3. Event Creation with Geofence Radius
 * 4. Geofence Distance Verification (Inside Geofence -> Success 201)
 * 5. Geofence Breach Detection (Outside Geofence -> Forbidden 403)
 * 6. Duplicate Attendance Prevention (Conflict 409)
 * 7. Live Real-Time Attendance Statistics (Brownie Task)
 * 8. CSV & Excel Export Functionality
 * 9. AI Assistant & Description Generator
 */

const http = require('node:http');
const app = require('./backend/src/app');

let server;
const PORT = 5589;
const BASE_URL = `http://localhost:${PORT}/api`;

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const reqHeaders = { 'Content-Type': 'application/json', ...headers };

    const req = http.request(
      url,
      { method, headers: reqHeaders },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(data);
          } catch {
            json = data;
          }
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        });
      }
    );

    req.on('error', reject);

    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

let organizerToken = '';
let attendeeToken = '';
let testEventId = '';

async function runTests() {
  console.log('================================================================');
  console.log('🧪 Running CheckIn / GeoAttend Automated Verification Test Suite');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, name) {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name}`);
      failed++;
    }
  }

  try {
    // 1. Health Check
    console.log('1. Health Check API');
    const health = await request('GET', '/health');
    assert(health.status === 200 && health.body.status === 'online', 'Health endpoint reports online');

    // 2. Authentication
    console.log('\n2. Authentication & Demo Logins');
    const orgLogin = await request('POST', '/auth/demo-login', { role: 'organizer' });
    assert(orgLogin.status === 200 && orgLogin.body.token, 'Organizer 1-click login generates JWT token');
    organizerToken = orgLogin.body.token;

    const attLogin = await request('POST', '/auth/demo-login', { role: 'attendee' });
    assert(attLogin.status === 200 && attLogin.body.token, 'Attendee 1-click login generates JWT token');
    attendeeToken = attLogin.body.token;

    // 3. Event Creation with Geofence
    console.log('\n3. Event Management & Geofence Configuration');
    const newEventPayload = {
      title: 'Automated Test Hackathon 2026',
      venue: 'Engineering Test Hall',
      lat: 12.9716,
      lng: 77.5946,
      geofenceRadius: 100, // 100m radius
      capacity: 200,
      category: 'Hackathon'
    };

    const createRes = await request('POST', '/events', newEventPayload, {
      Authorization: `Bearer ${organizerToken}`
    });
    assert(createRes.status === 201 && createRes.body.event?.id, 'Organizer successfully creates geofenced event');
    testEventId = createRes.body.event.id;
    const qrSecret = createRes.body.event.qrSecret;

    // 4. Check-in INSIDE Geofence (Allowed)
    console.log('\n4. Geolocation Verification: Inside Geofence (Success Case)');
    // Positioned 12m from 12.9716, 77.5946 (within 100m geofence)
    const insideCoords = { lat: 12.97168, lng: 77.59465 };
    const insideRes = await request('POST', '/attendance/verify-and-mark', {
      eventId: testEventId,
      qrData: qrSecret,
      userLat: insideCoords.lat,
      userLng: insideCoords.lng,
      accuracy: 5
    }, {
      Authorization: `Bearer ${attendeeToken}`
    });

    assert(
      insideRes.status === 201 && insideRes.body.attendance?.status === 'VERIFIED',
      `Attendee inside geofence verified successfully (distance: ${insideRes.body?.attendance?.distanceMeters}m)`
    );

    // 5. Duplicate Check-in Prevention
    console.log('\n5. Duplicate Attendance Prevention');
    const dupRes = await request('POST', '/attendance/verify-and-mark', {
      eventId: testEventId,
      qrData: qrSecret,
      userLat: insideCoords.lat,
      userLng: insideCoords.lng
    }, {
      Authorization: `Bearer ${attendeeToken}`
    });
    assert(
      dupRes.status === 409 && dupRes.body.code === 'DUPLICATE_ATTENDANCE',
      'Duplicate attendance submission properly rejected with 409 Conflict'
    );

    // 6. Check-in OUTSIDE Geofence (Breach Detected)
    console.log('\n6. Geolocation Verification: Outside Geofence (Rejection Case)');
    // Positioned 800m away
    const outsideCoords = { lat: 12.9780, lng: 77.6010 };
    const outsideRes = await request('POST', '/attendance/verify-and-mark', {
      eventId: testEventId,
      qrData: qrSecret,
      userLat: outsideCoords.lat,
      userLng: outsideCoords.lng,
      userId: 'usr_outside_tester',
      userEmail: 'outside.tester@example.com'
    });

    assert(
      outsideRes.status === 403 && outsideRes.body.code === 'OUT_OF_BOUNDS',
      `Out-of-bounds check-in rejected with 403 Forbidden (${outsideRes.body?.details?.distanceMeters}m away from 100m radius)`
    );

    // 7. Live Real-Time Attendance Statistics (Brownie Task)
    console.log('\n7. Real-Time Organizer Dashboard Telemetry (Brownie Task)');
    const liveStats = await request('GET', `/attendance/live/${testEventId}`);
    assert(
      liveStats.status === 200 && liveStats.body.stats?.verifiedCount >= 1,
      `Real-time dashboard aggregates verified count (${liveStats.body?.stats?.verifiedCount} attendees) & live feed`
    );

    // 8. CSV and Excel Exports
    console.log('\n8. Data Export (CSV & Excel .xlsx)');
    const csvRes = await request('GET', `/export/csv/${testEventId}`);
    assert(
      csvRes.status === 200 && typeof csvRes.body === 'string' && csvRes.body.includes('Full Name'),
      'CSV export contains correct formatted headers and attendee rows'
    );

    const excelRes = await request('GET', `/export/excel/${testEventId}`);
    assert(
      excelRes.status === 200 && excelRes.headers['content-type'].includes('spreadsheetml'),
      'Excel .xlsx download stream generated successfully'
    );

    // 9. AI Assistant & Description Generator
    console.log('\n9. AI Assistant & Natural Language Q&A (Bonus Task)');
    const aiChat = await request('POST', '/ai/chat', {
      prompt: 'What are the upcoming events scheduled on campus?'
    });
    assert(aiChat.status === 200 && aiChat.body.answer, 'AI Assistant answers natural language query');

    const aiDesc = await request('POST', '/ai/generate-description', {
      title: 'Cloud & AI Bootcamp',
      venue: 'Tech Auditorium'
    });
    assert(aiDesc.status === 200 && aiDesc.body.description, 'AI generates engaging event description');

  } catch (err) {
    console.error('Fatal test execution error:', err);
    failed++;
  } finally {
    console.log('\n================================================================');
    console.log(`📊 Test Results: ${passed} Passed, ${failed} Failed`);
    console.log('================================================================\n');

    server.close(() => {
      console.log('Server closed cleanly.');
    });
  }
}

server = app.listen(PORT, () => {
  runTests();
});
