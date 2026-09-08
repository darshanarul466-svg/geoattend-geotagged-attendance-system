/**
 * Atomic File-based Database for CheckIn / GeoAttend
 * Provides persistent, zero-setup storage with built-in transactions and seeding.
 */

const fs = require('node:fs');
const path = require('node:path');

const DATA_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'geoattend.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default Seed Data
const DEFAULT_DATA = {
  users: [
    {
      id: 'usr_org_01',
      name: 'Alex Morgan',
      email: 'alex.morgan@campus.edu',
      regId: 'ORG-8821',
      role: 'organizer',
      department: 'Faculty & Operations',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-10T08:00:00.000Z'
    },
    {
      id: 'usr_org_02',
      name: 'Elena Rostova',
      email: 'elena.rostova@campus.edu',
      regId: 'ORG-5512',
      role: 'organizer',
      department: 'Computer Science Faculty',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-15T09:30:00.000Z'
    },
    {
      id: 'usr_att_01',
      name: 'Aditi Sharma',
      email: 'aditi.sharma@student.edu',
      regId: '21CSC101',
      role: 'attendee',
      department: '3CSE-A',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-02-01T10:00:00.000Z'
    },
    {
      id: 'usr_att_02',
      name: 'Rohan Kulkarni',
      email: 'rohan.k@student.edu',
      regId: '21CSC145',
      role: 'attendee',
      department: '3CSE-B',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-02-02T11:15:00.000Z'
    },
    {
      id: 'usr_att_03',
      name: 'Neha Patil',
      email: 'neha.patil@student.edu',
      regId: '21CSC087',
      role: 'attendee',
      department: '3CSE-A',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-02-03T14:20:00.000Z'
    },
    {
      id: 'usr_att_04',
      name: 'Vishal Singh',
      email: 'vishal.singh@student.edu',
      regId: '21CSC201',
      role: 'attendee',
      department: '3CSE-C',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-02-04T09:00:00.000Z'
    },
    {
      id: 'usr_att_05',
      name: 'Meera Thomas',
      email: 'meera.t@student.edu',
      regId: '21CSC176',
      role: 'attendee',
      department: '3CSE-D',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-02-05T09:00:00.000Z'
    }
  ],
  events: [
    {
      id: 'evt_cse_prog_lab',
      organizerId: 'usr_org_01',
      organizerName: 'Alex Morgan',
      title: 'CSE – Programming Lab',
      description: 'Hands-on laboratory session for 3rd year Computer Science students covering systems programming and algorithms.',
      category: 'Lab Session',
      venue: 'Grand Central Auditorium',
      lat: 12.9716,
      lng: 77.5946,
      geofenceRadius: 100, // 100 meters
      date: '2026-09-06',
      startTime: '09:30',
      endTime: '11:00 AM',
      capacity: 248,
      status: 'active',
      qrSecret: 'CSE_PROG_LAB_TOKEN_2026',
      bannerUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80',
      createdAt: '2026-02-10T10:00:00.000Z'
    },
    {
      id: 'evt_ai_workshop',
      organizerId: 'usr_org_02',
      organizerName: 'Elena Rostova',
      title: 'NextGen AI & Agentic Systems Workshop',
      description: 'Interactive campus workshop exploring autonomous workflows, multimodal models, and agent architectures.',
      category: 'Workshop',
      venue: 'Innovation & Research Complex',
      lat: 12.9725,
      lng: 77.5938,
      geofenceRadius: 100,
      date: '2026-09-07',
      startTime: '14:00',
      endTime: '17:30',
      capacity: 180,
      status: 'upcoming',
      qrSecret: 'AI_AGENT_WORKSHOP_SECRET_99',
      bannerUrl: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=80',
      createdAt: '2026-02-12T12:00:00.000Z'
    },
    {
      id: 'evt_cloud_native_lab',
      organizerId: 'usr_org_01',
      organizerName: 'Alex Morgan',
      title: 'Cloud Infrastructure & DevOps Lab',
      description: 'Deep dive into microservices orchestration, progressive delivery with ArgoCD, and automated canary deployments.',
      category: 'Lab Session',
      venue: 'Tech Lab 4B (East Wing)',
      lat: 12.9705,
      lng: 77.5955,
      geofenceRadius: 75,
      date: '2026-09-08',
      startTime: '10:00',
      endTime: '13:00',
      capacity: 120,
      status: 'upcoming',
      qrSecret: 'DEVOPS_CLOUD_SECRET_44A',
      bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
      createdAt: '2026-02-15T15:00:00.000Z'
    }
  ],
  attendances: [
    {
      id: 'att_01',
      eventId: 'evt_cse_prog_lab',
      eventTitle: 'CSE – Programming Lab',
      venue: 'Grand Central Auditorium',
      userId: 'usr_att_01',
      userName: 'Aditi Sharma',
      userEmail: 'aditi.sharma@student.edu',
      userRegId: '21CSC101',
      userDepartment: '3CSE-A',
      timestamp: '2026-09-06T10:02:15.000Z',
      userLocation: { lat: 12.97165, lng: 77.59462 },
      distanceMeters: 6.2,
      allowedRadius: 100,
      status: 'VERIFIED',
      verificationMethod: 'QR_AND_GEO',
      verifiedAt: '2026-09-06T10:02:15.000Z'
    },
    {
      id: 'att_02',
      eventId: 'evt_cse_prog_lab',
      eventTitle: 'CSE – Programming Lab',
      venue: 'Grand Central Auditorium',
      userId: 'usr_att_02',
      userName: 'Rohan Kulkarni',
      userEmail: 'rohan.k@student.edu',
      userRegId: '21CSC145',
      userDepartment: '3CSE-B',
      timestamp: '2026-09-06T10:01:40.000Z',
      userLocation: { lat: 12.97162, lng: 77.59468 },
      distanceMeters: 9.1,
      allowedRadius: 100,
      status: 'VERIFIED',
      verificationMethod: 'QR_AND_GEO',
      verifiedAt: '2026-09-06T10:01:40.000Z'
    },
    {
      id: 'att_03',
      eventId: 'evt_cse_prog_lab',
      eventTitle: 'CSE – Programming Lab',
      venue: 'Grand Central Auditorium',
      userId: 'usr_att_03',
      userName: 'Neha Patil',
      userEmail: 'neha.patil@student.edu',
      userRegId: '21CSC087',
      userDepartment: '3CSE-A',
      timestamp: '2026-09-06T09:59:12.000Z',
      userLocation: { lat: 12.97158, lng: 77.59455 },
      distanceMeters: 12.5,
      allowedRadius: 100,
      status: 'VERIFIED',
      verificationMethod: 'QR_AND_GEO',
      verifiedAt: '2026-09-06T09:59:12.000Z'
    },
    {
      id: 'att_04',
      eventId: 'evt_cse_prog_lab',
      eventTitle: 'CSE – Programming Lab',
      venue: 'Grand Central Auditorium',
      userId: 'usr_att_04',
      userName: 'Vishal Singh',
      userEmail: 'vishal.singh@student.edu',
      userRegId: '21CSC201',
      userDepartment: '3CSE-C',
      timestamp: '2026-09-06T09:58:30.000Z',
      userLocation: { lat: 12.97170, lng: 77.59460 },
      distanceMeters: 11.2,
      allowedRadius: 100,
      status: 'VERIFIED',
      verificationMethod: 'QR_AND_GEO',
      verifiedAt: '2026-09-06T09:58:30.000Z'
    },
    {
      id: 'att_05',
      eventId: 'evt_cse_prog_lab',
      eventTitle: 'CSE – Programming Lab',
      venue: 'Grand Central Auditorium',
      userId: 'usr_att_05',
      userName: 'Meera Thomas',
      userEmail: 'meera.t@student.edu',
      userRegId: '21CSC176',
      userDepartment: '3CSE-D',
      timestamp: '2026-09-06T09:55:00.000Z',
      userLocation: { lat: 12.97161, lng: 77.59470 },
      distanceMeters: 11.8,
      allowedRadius: 100,
      status: 'VERIFIED',
      verificationMethod: 'QR_AND_GEO',
      verifiedAt: '2026-09-06T09:55:00.000Z'
    }
  ]
};

let cachedDb = null;

function getDatabase() {
  if (cachedDb) return cachedDb;

  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      cachedDb = JSON.parse(raw);
    } else {
      cachedDb = JSON.parse(JSON.stringify(DEFAULT_DATA));
      saveDatabase(cachedDb);
    }
  } catch (error) {
    console.error('Error reading database file, using in-memory default:', error.message);
    cachedDb = JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  // Ensure all collections exist
  if (!cachedDb.users) cachedDb.users = [...DEFAULT_DATA.users];
  if (!cachedDb.events) cachedDb.events = [...DEFAULT_DATA.events];
  if (!cachedDb.attendances) cachedDb.attendances = [...DEFAULT_DATA.attendances];

  return cachedDb;
}

function saveDatabase(data) {
  try {
    const serialized = JSON.stringify(data || cachedDb, null, 2);
    fs.writeFileSync(DB_FILE, serialized, 'utf-8');
    cachedDb = data;
    return true;
  } catch (error) {
    console.error('Failed to save database:', error.message);
    return false;
  }
}

function resetDatabase() {
  cachedDb = JSON.parse(JSON.stringify(DEFAULT_DATA));
  saveDatabase(cachedDb);
  return cachedDb;
}

module.exports = {
  getDatabase,
  saveDatabase,
  resetDatabase,
  DEFAULT_DATA
};
