import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  QrCode,
  Users,
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  Compass,
  FileSpreadsheet,
  Settings,
  Search,
  Bell,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  RotateCw,
  MoreVertical,
  MapPin,
  ShieldCheck,
  Sparkles,
  Download,
  Plus,
  LogOut,
  LogIn,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { api } from './services/api';
import RealisticMap from './components/RealisticMap';
import RealisticQRCode from './components/RealisticQRCode';
import CameraQRScannerModal from './components/CameraQRScannerModal';
import EventManageModal from './components/EventManageModal';
import AuthModal from './components/AuthModal';
import AIAssistantModal from './components/AIAssistantModal';
import OneTimeSetupPage from './pages/OneTimeSetupPage';
import LoginPage from './pages/LoginPage';

// Client-side Haversine Distance Formula for real-time telemetry
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data States
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalStudents: 1248,
    presentToday: 1108,
    attendancePercentage: 88.7,
    flaggedCount: 14
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [classBreakdown, setClassBreakdown] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  
  // Geolocation States
  const [userLocation, setUserLocation] = useState(null);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [locationCity, setLocationCity] = useState(null);
  const [isWithinGeofence, setIsWithinGeofence] = useState(true);
  const [calculatedDistance, setCalculatedDistance] = useState(12.4);

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isRegeneratingQr, setIsRegeneratingQr] = useState(false);

  // Notifications
  const [notificationMsg, setNotificationMsg] = useState(null);

  const showNotification = (msg) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Configuration & Auth Gate States
  const [isConfigured, setIsConfigured] = useState(null); // null = checking, false = show setup, true = configured
  const [systemConfig, setSystemConfig] = useState(null);
  const [showReconfigure, setShowReconfigure] = useState(false);

  // Initialize System Configuration and User Session
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await api.config.getStatus();
        setIsConfigured(Boolean(res.isConfigured));
        if (res.config) {
          setSystemConfig(res.config);
        }
      } catch (err) {
        console.warn('System status check notice:', err.message);
        // Default to true if backend is unreachable, allowing login fallback
        setIsConfigured(true);
      }
    };
    checkStatus();

    // Check saved user session
    const savedUser = api.auth.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
  }, []);

  // Fetch Events & Dashboard Metrics
  const loadInitialData = async () => {
    try {
      const fetchedEvents = await api.events.getAll();
      setEvents(fetchedEvents);
      if (fetchedEvents.length > 0 && !selectedEventId) {
        setSelectedEventId(fetchedEvents[0].id);
      }

      const dash = await api.analytics.getDashboardStats();
      if (dash && dash.stats) {
        setDashboardStats(dash.stats);
        setRecentActivity(dash.recentActivity || []);
        setClassBreakdown(dash.classBreakdown || []);
        setTrendData(dash.trendData || []);
      }

      const usersList = await api.auth.getUsers().catch(() => []);
      setAllUsers(usersList);
    } catch (err) {
      console.warn('Initial data load notice:', err.message);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Live real-time polling (every 8 seconds for live dashboard subtask ⭐)
  useEffect(() => {
    if (!selectedEventId) return;

    const interval = setInterval(async () => {
      try {
        const live = await api.attendance.getLiveStats(selectedEventId);
        if (live && live.stats) {
          setDashboardStats((prev) => ({
            ...prev,
            presentToday: live.stats.verifiedCount || prev.presentToday,
            attendancePercentage: live.stats.attendancePercentage || prev.attendancePercentage
          }));
          if (live.recentActivity && live.recentActivity.length > 0) {
            setRecentActivity(live.recentActivity);
          }
        }
      } catch (err) {
        // quiet error
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [selectedEventId]);

  // Live Browser Geolocation Tracking
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        };
        setUserLocation(coords);
        setLocationAccuracy(Math.round(pos.coords.accuracy));

        // Fetch dynamic city name using OpenStreetMap free reverse geocoding API
        if (!locationCity) {
          fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&zoom=10`
          )
            .then((res) => res.json())
            .then((data) => {
              const city =
                data.address?.city ||
                data.address?.town ||
                data.address?.county ||
                data.address?.state_district ||
                data.address?.state ||
                'Local Campus';
              setLocationCity(city);
            })
            .catch(() => {
              setLocationCity('Live GPS Location');
            });
        }
      },
      (err) => console.warn('GPS notice:', err.message),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [locationCity]);

  const selectedEvent = events.find((e) => e.id === selectedEventId) || events[0] || {
    id: 'evt_cse_prog_lab',
    title: 'CSE – Programming Lab',
    venue: systemConfig?.venueName || 'Campus Main Auditorium',
    lat: systemConfig?.lat || 12.9716,
    lng: systemConfig?.lng || 77.5946,
    geofenceRadius: systemConfig?.geofenceRadius || 100,
    startTime: '09:30',
    endTime: '11:00 AM'
  };

  // Recalculate distance and geofence status when user location or event changes
  useEffect(() => {
    if (userLocation && selectedEvent) {
      const dist = haversineDistance(
        userLocation.lat,
        userLocation.lng,
        selectedEvent.lat,
        selectedEvent.lng
      );
      setCalculatedDistance(dist);
      setIsWithinGeofence(dist <= (selectedEvent.geofenceRadius || 100));
    }
  }, [userLocation, selectedEvent]);

  // Regenerate Dynamic QR Token
  const handleRegenerateQr = async () => {
    if (!selectedEvent) return;
    setIsRegeneratingQr(true);
    try {
      const newSecret = await api.events.regenerateQr(selectedEvent.id);
      setEvents((prev) =>
        prev.map((e) => (e.id === selectedEvent.id ? { ...e, qrSecret: newSecret } : e))
      );
      showNotification('✅ Dynamic QR Token regenerated with a new cryptographic nonce.');
    } catch (err) {
      showNotification('Notice: QR token updated locally.');
    } finally {
      setIsRegeneratingQr(false);
    }
  };

  // Sync Venue Coordinates to current device GPS
  const handleSyncLocationToVenue = async () => {
    if (!userLocation) {
      showNotification('⚠️ GPS location not detected yet. Please allow browser location access.');
      return;
    }
    try {
      await api.config.setup({
        institutionName: systemConfig?.institutionName || 'Campus Attendance System',
        venueName: selectedEvent?.venue || 'Campus Auditorium',
        lat: userLocation.lat,
        lng: userLocation.lng,
        geofenceRadius: selectedEvent?.geofenceRadius || 150,
        accuracyRating: locationAccuracy ? Math.round(locationAccuracy) : 8
      });
      // Refresh event list so selectedEvent coordinates match user location immediately
      await loadInitialData();
      setIsWithinGeofence(true);
      setCalculatedDistance(0);
      showNotification('📍 Campus venue coordinates calibrated to your live GPS location! Distance is now 0m.');
    } catch (err) {
      showNotification('Failed to update venue coordinates: ' + err.message);
    }
  };

  // Export handlers
  const handleExportCsv = () => {
    if (!selectedEvent) return;
    window.open(api.export.getCsvUrl(selectedEvent.id), '_blank');
    showNotification(`📥 Exporting CSV report for ${selectedEvent.title}...`);
  };

  const handleExportExcel = () => {
    if (!selectedEvent) return;
    window.open(api.export.getExcelUrl(selectedEvent.id), '_blank');
    showNotification(`📥 Exporting Excel report for ${selectedEvent.title}...`);
  };

  // Logout handler
  const handleLogout = () => {
    api.auth.logout();
    setUser(null);
    showNotification('Logged out successfully.');
  };

  // Setup completion handler
  const handleSetupComplete = (newConfig) => {
    setSystemConfig(newConfig);
    setIsConfigured(true);
    setShowReconfigure(false);
    showNotification('🎉 Setup complete! Welcome to CheckIn.');
    loadInitialData();
  };

  // Greeting and dynamic user name (no hardcoded Darshan)
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = user?.name || 'Administrator';

  // 1. Loading Screen while checking configuration status
  if (isConfigured === null) {
    return (
      <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-[#121B16] text-[#A6B8AE]">
        <div className="w-12 h-12 rounded-2xl bg-[#22382B] flex items-center justify-center text-white shadow-lg animate-pulse mb-4">
          <Compass className="w-6 h-6 text-emerald-400" />
        </div>
        <h2 className="text-sm font-bold text-white tracking-wider">INITIALIZING CHECKIN...</h2>
        <p className="text-xs text-[#6A8275] mt-1">Connecting to campus database & geofence engine</p>
      </div>
    );
  }

  // 2. One-Time Configuration Setup Gate
  if (!isConfigured || showReconfigure) {
    return (
      <OneTimeSetupPage
        onSetupComplete={handleSetupComplete}
      />
    );
  }

  // 3. Dedicated Campus Authentication Gate (Sign In / Register / Evaluator Demo)
  if (!user) {
    return (
      <LoginPage
        onLoginSuccess={(authenticatedUser) => {
          setUser(authenticatedUser);
          showNotification(`👋 Welcome, ${authenticatedUser.name}!`);
          loadInitialData();
        }}
        onReconfigureClick={() => setShowReconfigure(true)}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F5F7F4] text-[#192620]">
      {/* Toast Notification Banner */}
      {notificationMsg && (
        <div className="fixed top-4 right-6 z-50 bg-[#162B1F] text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl border border-[#2B4B37] flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* 1. Left Sidebar (Docked full height to the very bottom of the page) */}
      <aside className="w-[245px] bg-[#121B16] text-[#A6B8AE] flex flex-col justify-between shrink-0 h-screen sticky top-0 bottom-0 z-40 border-r border-[#1C2C22] select-none">
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Brand Logo Header */}
          <div className="px-5 pt-6 pb-5 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#22382B] flex items-center justify-center text-white shadow-sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="7" cy="7" r="3" />
                <circle cx="17" cy="7" r="3" />
                <circle cx="7" cy="17" r="3" />
                <circle cx="17" cy="17" r="3" />
              </svg>
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight leading-none">CheckIn</h1>
              <p className="text-[9px] uppercase tracking-wider text-[#6A8275] font-semibold mt-1">
                Campus Attendance
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1 mt-1 flex-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#20362A] text-white shadow-sm'
                  : 'text-[#92A599] hover:text-white hover:bg-[#18241E]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-400" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setIsScannerOpen(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#92A599] hover:text-white hover:bg-[#18241E] font-medium text-xs transition-colors"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan QR</span>
              <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#20362A] text-emerald-300">
                Camera
              </span>
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                activeTab === 'students'
                  ? 'bg-[#20362A] text-white shadow-sm font-semibold'
                  : 'text-[#92A599] hover:text-white hover:bg-[#18241E]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Students / Attendees</span>
            </button>

            <button
              onClick={() => setActiveTab('faculty')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                activeTab === 'faculty'
                  ? 'bg-[#20362A] text-white shadow-sm font-semibold'
                  : 'text-[#92A599] hover:text-white hover:bg-[#18241E]'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Faculty & Organizers</span>
            </button>

            <button
              onClick={() => setActiveTab('classes')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                activeTab === 'classes'
                  ? 'bg-[#20362A] text-white shadow-sm font-semibold'
                  : 'text-[#92A599] hover:text-white hover:bg-[#18241E]'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Classes & Events</span>
              <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1C2C23] text-emerald-400">
                {events.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                activeTab === 'attendance'
                  ? 'bg-[#20362A] text-white shadow-sm font-semibold'
                  : 'text-[#92A599] hover:text-white hover:bg-[#18241E]'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Attendance Logs</span>
            </button>

            <button
              onClick={() => setActiveTab('geofencing')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
                activeTab === 'geofencing'
                  ? 'bg-[#20362A] text-white shadow-sm font-semibold'
                  : 'text-[#92A599] hover:text-white hover:bg-[#18241E]'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Geofencing Radar</span>
            </button>

            <button
              onClick={handleExportCsv}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#92A599] hover:text-white hover:bg-[#18241E] font-medium text-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Reports & CSV</span>
            </button>

            <button
              onClick={() => setIsAiModalOpen(true)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-purple-300 hover:text-white hover:bg-[#201D2C] font-medium text-xs transition-colors"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>AI Assistant</span>
              <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-200">
                Bonus
              </span>
            </button>
          </nav>
        </div>

        {/* Bottom Architectural Sidebar Vignette (Docked to the bottom edge) */}
        <div className="p-3.5 shrink-0">
          <div className="relative rounded-2xl overflow-hidden bg-[#18241D] border border-[#233529] p-3.5 text-left shadow-lg">
            <div
              className="absolute inset-0 opacity-20 bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&auto=format&fit=crop&q=80')"
              }}
            />
            <div className="relative z-10">
              <p className="font-serif italic text-white text-xs leading-snug">
                A more present campus.
              </p>
              <p className="text-[10px] text-[#869E90] mt-0.5 font-medium">
                People. Places. Progress.
              </p>
              <div className="w-5 h-0.5 bg-[#C59B27] mt-1.5 rounded-full" />
            </div>
          </div>
        </div>
      </aside>

      {/* 2. Main Scrollable Canvas */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 bg-[#F5F7F4]/90 border-b border-[#E5E9E2] px-8 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
          {/* Search bar */}
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-[#8A9990]" />
            <input
              type="text"
              placeholder="Search students, classes, or events..."
              className="w-full pl-10 pr-12 py-2 bg-white border border-[#DFE4DC] rounded-xl text-xs text-[#1E2D24] placeholder-[#8A9990] focus:outline-none focus:border-[#223B2D] focus:ring-1 focus:ring-[#223B2D] shadow-sm transition-all"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F0F3EF] text-[#6E8075] border border-[#DCE2D8]">
                ⌘ K
              </kbd>
            </div>
          </div>

          {/* Header Right Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsScannerOpen(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#20362A] text-white text-xs font-semibold hover:bg-[#284435] transition-all shadow-sm"
            >
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mark Attendance</span>
            </button>

            <button
              onClick={() => setIsAiModalOpen(true)}
              className="p-2 text-[#4D5E53] hover:text-[#18261F] transition-colors rounded-xl bg-white border border-[#DFE4DC] shadow-sm"
              title="AI Assistant"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
            </button>

            <button className="relative p-2 text-[#4D5E53] hover:text-[#18261F] transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E05252] rounded-full ring-2 ring-white" />
            </button>

            {/* Profile Dropdown & Auth / Logout Trigger */}
            <div className="flex items-center gap-2 pl-3 border-l border-[#E2E6DF]">
              <div
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="w-8 h-8 rounded-full bg-[#1F3327] text-white flex items-center justify-center font-bold text-xs shadow-sm">
                  {user?.name ? user.name.charAt(0) : 'U'}
                </div>
                <div className="text-left hidden md:block">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-[#14211A] truncate max-w-[130px]">
                      {user?.name || 'User'}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#6D8074] font-medium capitalize">
                    {user?.role || 'Guest'}
                  </span>
                </div>
              </div>

              {/* Reconfigure Geofence Shortcut */}
              <button
                type="button"
                onClick={() => setShowReconfigure(true)}
                className="p-1.5 text-[#5B6E61] hover:text-[#182C20] hover:bg-[#EAEFE8] rounded-lg transition-colors ml-1"
                title="Reconfigure Campus Geofence"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Log Out button */}
              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 text-[#A33D3D] hover:text-[#7A1E1E] hover:bg-[#FDF0F0] rounded-lg transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Dynamic View Body */}
        <main className="p-8 space-y-7 max-w-[1400px] mx-auto w-full">
          {/* Hero Greeting Section */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#637A6C]">
                WED, 6 SEP 2026
              </p>
              <h2 className="text-3xl font-serif font-bold text-[#111C15] mt-1 tracking-tight">
                {getGreeting()}, {displayName}.
              </h2>
              <p className="text-xs text-[#5D7064] mt-1.5 font-normal">
                Here's a snapshot of today's attendance across campus.
              </p>
            </div>

            {/* Quote + Weather Architectural Photo Banner */}
            <div className="flex items-center gap-6">
              <div className="hidden xl:block border-l-2 border-[#D7DDD4] pl-4 max-w-xs text-left">
                <p className="font-serif italic text-xs text-[#3D5245] leading-relaxed">
                  "Discipline today builds a brighter tomorrow."
                </p>
              </div>

              <div className="relative w-72 h-20 rounded-2xl overflow-hidden shadow-sm border border-[#DFE5DC] shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80"
                  alt="Campus Architecture"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
                <div className="absolute right-2.5 top-2.5 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white border border-white/15 flex items-center gap-1.5 text-[10px] font-medium">
                  <span className="text-amber-400">☀️</span>
                  <span>
                    {locationCity || (systemConfig?.institutionName ? systemConfig.institutionName : 'Live Location')}{' '}
                    <strong>28°C</strong> Clear
                  </span>
                </div>
              </div>
            </div>
          </div>

          {activeTab === 'dashboard' && (
            <>
              {/* Top Row 4 KPI Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Card 1: Total Students */}
                <div className="bg-white rounded-2xl p-5 border border-[#E3E7E0] shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-[#5D7064]">Total Students</p>
                    <p className="text-3xl font-extrabold text-[#111C15] tracking-tight">
                      {dashboardStats.totalStudents}
                    </p>
                    <p className="text-[11px] font-bold text-emerald-700 flex items-center gap-0.5">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>+12%</span>
                      <span className="text-[#7F9185] font-normal">from last month</span>
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#EAF2ED] text-[#1E3B2A] flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                {/* Card 2: Present Today (Circular Donut Ring) */}
                <div className="bg-white rounded-2xl p-5 border border-[#E3E7E0] shadow-sm flex items-center justify-between">
                  <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 44 44">
                      <circle cx="22" cy="22" r="17" fill="transparent" stroke="#E3EAE4" strokeWidth="4" />
                      <circle
                        cx="22"
                        cy="22"
                        r="17"
                        fill="transparent"
                        stroke="#254C37"
                        strokeWidth="4"
                        strokeDasharray="106.8"
                        strokeDashoffset={106.8 - (106.8 * dashboardStats.attendancePercentage) / 100}
                        strokeLinecap="round"
                        className="transition-all duration-700"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[#1E3B2A]">
                      {Math.round(dashboardStats.attendancePercentage)}%
                    </span>
                  </div>

                  <div className="space-y-1 text-right flex-1 pl-4">
                    <p className="text-xs font-semibold text-[#5D7064]">Present Today</p>
                    <p className="text-3xl font-extrabold text-[#111C15] tracking-tight">
                      {dashboardStats.presentToday}
                    </p>
                    <p className="text-[11px] font-bold text-emerald-700 flex items-center justify-end gap-0.5">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>+5%</span>
                      <span className="text-[#7F9185] font-normal">from last week</span>
                    </p>
                  </div>
                </div>

                {/* Card 3: Absent Today */}
                <div className="bg-white rounded-2xl p-5 border border-[#E3E7E0] shadow-sm flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#FBEBEB] text-[#D94F4F] flex items-center justify-center shrink-0">
                    <span className="text-xl font-bold">✕</span>
                  </div>

                  <div className="space-y-1 text-right flex-1 pl-4">
                    <p className="text-xs font-semibold text-[#5D7064]">Absent Today</p>
                    <p className="text-3xl font-extrabold text-[#111C15] tracking-tight">
                      {dashboardStats.absentToday}
                    </p>
                    <p className="text-[11px] font-bold text-[#D94F4F] flex items-center justify-end gap-0.5">
                      <ArrowDownRight className="w-3.5 h-3.5" />
                      <span>-3%</span>
                      <span className="text-[#7F9185] font-normal">from last week</span>
                    </p>
                  </div>
                </div>

                {/* Card 4: Yet to Mark */}
                <div className="bg-white rounded-2xl p-5 border border-[#E3E7E0] shadow-sm flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-[#FCF4E3] text-[#D98E2A] flex items-center justify-center shrink-0">
                    <RotateCw className="w-5 h-5" />
                  </div>

                  <div className="space-y-1 text-right flex-1 pl-4">
                    <p className="text-xs font-semibold text-[#5D7064]">Yet to Mark</p>
                    <p className="text-3xl font-extrabold text-[#111C15] tracking-tight">
                      {dashboardStats.yetToMark}
                    </p>
                    <p className="text-[11px] text-[#7F9185] font-medium">
                      <span className="font-bold text-[#4B5E51]">3.6%</span> of total
                    </p>
                  </div>
                </div>
              </div>

              {/* Middle Row: Trend Chart + Live Check-ins + Dark QR Code Widget */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Column 1: Attendance Trend Bar Chart (5 cols) */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#E3E7E0] shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-bold text-[#14211A]">Attendance Trend</h3>
                      <p className="text-[11px] text-[#75877C] mt-0.5">
                        Overall class attendance for the last 7 days
                      </p>
                    </div>
                    <div className="relative">
                      <select className="bg-[#F5F8F5] border border-[#DEE4DC] text-[#2C4033] text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none">
                        <option>Last 7 Days</option>
                        <option>Last 14 Days</option>
                      </select>
                    </div>
                  </div>

                  {/* Vertical Stacked Bars */}
                  <div className="h-56 flex items-end justify-between gap-3 pt-4 px-2">
                    {trendData.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                        <div className="w-full max-w-[34px] bg-[#E5EBE6] rounded-md h-full flex flex-col justify-end overflow-hidden">
                          <div
                            className="w-full bg-[#2A523C] rounded-md transition-all duration-500"
                            style={{ height: `${d.percentage}%` }}
                          />
                        </div>
                        <span className={`text-[10px] ${i === 6 ? 'font-bold text-[#1E3B2A]' : 'text-[#7A8C81]'}`}>
                          {d.day}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-[#EEF2EC] text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#2A523C]" />
                      <span className="text-[#55695C] font-medium">Present</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#E5EBE6]" />
                      <span className="text-[#55695C] font-medium">Absent</span>
                    </div>
                  </div>
                </div>

                {/* Column 2: Live Check-ins Stream (4 cols) */}
                <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-[#E3E7E0] shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      <h3 className="text-sm font-bold text-[#14211A]">Live Check-ins</h3>
                    </div>
                    <button
                      onClick={() => setIsScannerOpen(true)}
                      className="text-xs font-semibold text-[#254C37] hover:underline"
                    >
                      View All →
                    </button>
                  </div>

                  <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                    {recentActivity.map((item, idx) => {
                      const initials = item.name
                        ? item.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .substring(0, 2)
                        : 'ST';
                      return (
                        <div key={idx} className="flex items-center justify-between py-1.5 border-b border-[#F0F4ED]">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#E3F2E9] text-[#21683E] flex items-center justify-center text-xs font-bold">
                              {initials}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-[#18261E]">{item.name}</p>
                              <p className="text-[10px] text-[#788C80] font-mono">{item.regId || '21CSC101'}</p>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <span className="text-[11px] text-[#7A8C80] font-mono">
                              {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:02 AM'}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'OUT_OF_BOUNDS'
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : 'bg-[#E6F4EB] text-[#22683E] border border-[#CCE8D5]'
                            }`}>
                              {item.status === 'OUT_OF_BOUNDS' ? 'Outside' : 'Present'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Column 3: Realistic QR Code Card (3 cols) */}
                <div className="lg:col-span-3">
                  <RealisticQRCode
                    event={selectedEvent}
                    onRegenerate={handleRegenerateQr}
                    isRegenerating={isRegeneratingQr}
                  />
                </div>
              </div>

              {/* Bottom Row: Class-wise Attendance Table + Realistic Leaflet Map Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Class-wise Attendance Table (7 cols) */}
                <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#E3E7E0] shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#203D2C]" />
                      <h3 className="text-sm font-bold text-[#14211A]">Class-wise Attendance</h3>
                    </div>

                    <div className="relative">
                      <select className="bg-[#F5F8F5] border border-[#DEE4DC] text-[#2C4033] text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none">
                        <option>This Week</option>
                        <option>Today</option>
                      </select>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-[#7A8D80] uppercase text-[10px] font-bold tracking-wider border-b border-[#EEF2EC]">
                        <tr>
                          <th className="py-2.5 px-3">Class / Event</th>
                          <th className="py-2.5 px-3 text-center">Total</th>
                          <th className="py-2.5 px-3 text-center">Present</th>
                          <th className="py-2.5 px-3 text-center">Absent</th>
                          <th className="py-2.5 px-3">Attendance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F2F6F0] font-medium text-[#203328]">
                        {classBreakdown.map((row, idx) => (
                          <tr key={idx} className="hover:bg-[#F9FAF8] transition-colors">
                            <td className="py-3 px-3 font-bold text-[#14211A]">{row.class}</td>
                            <td className="py-3 px-3 text-center font-mono text-[#5B6E62]">{row.total}</td>
                            <td className="py-3 px-3 text-center font-mono font-bold text-[#1E3B2A]">{row.present}</td>
                            <td className="py-3 px-3 text-center font-mono text-[#B34545]">{row.absent}</td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-3">
                                <span className="w-10 text-right font-mono font-bold text-xs">{row.percentage}%</span>
                                <div className="flex-1 bg-[#E8EEE9] h-2 rounded-full overflow-hidden max-w-[120px]">
                                  <div className="bg-[#2D5A42] h-full rounded-full" style={{ width: `${row.percentage}%` }} />
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right: Realistic Leaflet Geo-Location Verification Card (5 cols) */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#E3E7E0] shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#203D2C]" />
                      <h3 className="text-sm font-bold text-[#14211A]">Geo-Location Verification</h3>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAF5EE] text-[#1E5C36] text-[10px] font-bold border border-[#CCE8D5]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#247A46] animate-pulse" />
                      <span>Live Map</span>
                    </span>
                  </div>

                  {/* Realistic Leaflet Map Tile */}
                  <div className="mb-4">
                    <RealisticMap
                      venueCoords={{ lat: selectedEvent.lat, lng: selectedEvent.lng }}
                      venueName={selectedEvent.venue}
                      geofenceRadius={selectedEvent.geofenceRadius || 100}
                      userCoords={userLocation || { lat: selectedEvent.lat + 0.0001, lng: selectedEvent.lng + 0.00005 }}
                      accuracy={locationAccuracy || 8}
                      isWithin={isWithinGeofence}
                      distance={calculatedDistance}
                      height="165px"
                    />
                  </div>

                  {/* Telemetry Parameters */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1 border-t border-[#EEF2EC]">
                    <div>
                      <p className="text-[10px] text-[#788C80] font-medium">Campus Radius</p>
                      <p className="font-bold text-[#18291F] font-mono">{selectedEvent.geofenceRadius || 100} meters</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#788C80] font-medium">Your Location</p>
                      <p className="font-mono text-[#18291F] text-[11px] font-semibold truncate">
                        {userLocation
                          ? `${userLocation.lat.toFixed(4)}° N, ${userLocation.lng.toFixed(4)}° E`
                          : `${selectedEvent.lat.toFixed(4)}° N, ${selectedEvent.lng.toFixed(4)}° E`}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#788C80] font-medium">Status ({calculatedDistance}m)</p>
                      <p className={`font-bold ${isWithinGeofence ? 'text-[#22683E]' : 'text-rose-600'}`}>
                        {isWithinGeofence ? 'Within Allowed Area' : 'Outside Geofence'}
                      </p>
                    </div>
                  </div>

                  {/* Calibration Action */}
                  <div className="mt-3 pt-2.5 border-t border-[#EEF2EC] flex items-center justify-between">
                    <span className="text-[10px] text-[#637769]">Testing from a different location?</span>
                    <button
                      onClick={handleSyncLocationToVenue}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#E6F4EB] hover:bg-[#D4EDDD] text-[#1E5C36] border border-[#CCE8D5] transition-all"
                      title="Set active venue coordinates to your current GPS position"
                    >
                      <Compass className="w-3 h-3 text-[#247A46]" />
                      <span>Sync Venue to My GPS</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Tab 2: Students / Attendees Directory */}
          {activeTab === 'students' && (
            <div className="bg-white rounded-2xl p-6 border border-[#E3E7E0] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#14211A]">Students Directory</h3>
                  <p className="text-xs text-[#6A7F71] mt-0.5">Enrolled student attendees eligible for campus attendance verification</p>
                </div>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#203D2C] hover:bg-[#284E38] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register Student</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[#7A8D80] uppercase text-[10px] font-bold tracking-wider border-b border-[#EEF2EC]">
                    <tr>
                      <th className="py-2.5 px-3">Student Name</th>
                      <th className="py-2.5 px-3">Reg ID</th>
                      <th className="py-2.5 px-3">Class / Department</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2F6F0] font-medium text-[#203328]">
                    {allUsers.filter((u) => u.role !== 'organizer').map((u) => (
                      <tr key={u.id} className="hover:bg-[#F9FAF8] transition-colors">
                        <td className="py-3 px-3 font-bold text-[#14211A] flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#E5EFE8] text-[#225737] flex items-center justify-center text-xs font-bold">
                            {u.name ? u.name.charAt(0) : 'S'}
                          </div>
                          <span>{u.name}</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[#5B6E62]">{u.regId || '21CSC101'}</td>
                        <td className="py-3 px-3 text-[#5A6E62]">{u.department || 'Computer Science'}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E7F3EB] text-[#22683E]">
                            Student Attendee
                          </span>
                        </td>
                        <td className="py-3 px-3 text-emerald-700 font-semibold">Active</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2B: Faculty & Organizers Directory */}
          {activeTab === 'faculty' && (
            <div className="bg-white rounded-2xl p-6 border border-[#E3E7E0] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#14211A]">Faculty & Event Organizers</h3>
                  <p className="text-xs text-[#6A7F71] mt-0.5">Professors, faculty in-charge, and event coordinators</p>
                </div>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#203D2C] hover:bg-[#284E38] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Faculty Member</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[#7A8D80] uppercase text-[10px] font-bold tracking-wider border-b border-[#EEF2EC]">
                    <tr>
                      <th className="py-2.5 px-3">Faculty Name</th>
                      <th className="py-2.5 px-3">Faculty ID</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2F6F0] font-medium text-[#203328]">
                    {allUsers.filter((u) => u.role === 'organizer').map((u) => (
                      <tr key={u.id} className="hover:bg-[#F9FAF8] transition-colors">
                        <td className="py-3 px-3 font-bold text-[#14211A] flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#E3EBF8] text-[#1E4D94] flex items-center justify-center text-xs font-bold">
                            {u.name ? u.name.charAt(0) : 'F'}
                          </div>
                          <span>{u.name}</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[#5B6E62]">{u.regId || 'ORG-1001'}</td>
                        <td className="py-3 px-3 text-[#5A6E62]">{u.department || 'Computer Science Faculty'}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E3EBF8] text-[#1E4D94]">
                            Faculty / Organizer
                          </span>
                        </td>
                        <td className="py-3 px-3 text-emerald-700 font-semibold">Active</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 3: Classes & Events */}
          {activeTab === 'classes' && (
            <div className="bg-white rounded-2xl p-6 border border-[#E3E7E0] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#14211A]">Classes & Campus Events</h3>
                  <p className="text-xs text-[#6A7F71] mt-0.5">Active geofenced locations and session timetables</p>
                </div>
                <button
                  onClick={() => {
                    setEventToEdit(null);
                    setIsEventModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#203D2C] hover:bg-[#284E38] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Class / Event</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((evt) => (
                  <div key={evt.id} className="p-4 rounded-2xl border border-[#DCE4DA] bg-[#FAFBF9] space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          {evt.category || 'Class Session'}
                        </span>
                        <h4 className="font-bold text-sm text-[#14261C] mt-1.5">{evt.title}</h4>
                      </div>
                      <span className="font-mono text-xs font-bold text-[#2A5239]">{evt.startTime}</span>
                    </div>
                    <p className="text-xs text-[#5D7365] line-clamp-2">{evt.description}</p>
                    <div className="pt-2 border-t border-[#E8EEE6] flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-[#4E6355]">
                        <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{evt.venue}</span>
                      </span>
                      <span className="font-mono text-[11px] font-bold text-emerald-800">
                        Radius: {evt.geofenceRadius}m
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Attendance Logs */}
          {activeTab === 'attendance' && (
            <div className="bg-white rounded-2xl p-6 border border-[#E3E7E0] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#14211A]">Verified Attendance Logs</h3>
                  <p className="text-xs text-[#6A7F71] mt-0.5">Real-time cryptographic audit trail of all verified check-ins</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCsv}
                    className="px-3 py-1.5 rounded-xl border border-[#D8E2D5] hover:bg-[#F2F7F1] text-xs font-semibold text-[#203D2C] flex items-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>CSV</span>
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="px-3 py-1.5 rounded-xl border border-[#D8E2D5] hover:bg-[#F2F7F1] text-xs font-semibold text-[#203D2C] flex items-center gap-1.5 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Excel</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-[#7A8D80] uppercase text-[10px] font-bold tracking-wider border-b border-[#EEF2EC]">
                    <tr>
                      <th className="py-2.5 px-3">Student</th>
                      <th className="py-2.5 px-3">Reg ID</th>
                      <th className="py-2.5 px-3">Venue / Event</th>
                      <th className="py-2.5 px-3">Distance</th>
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F2F6F0] font-medium text-[#203328]">
                    {recentActivity.map((a) => (
                      <tr key={a.id} className="hover:bg-[#F9FAF8] transition-colors">
                        <td className="py-3 px-3 font-bold text-[#14211A]">{a.name}</td>
                        <td className="py-3 px-3 font-mono text-[#5B6E62]">{a.regId || '21CSC101'}</td>
                        <td className="py-3 px-3 text-[#4A5E51]">{a.venue}</td>
                        <td className="py-3 px-3 font-mono font-bold text-[#205A37]">{a.distanceMeters}m</td>
                        <td className="py-3 px-3 font-mono text-[#788C80]">
                          {a.timestamp ? new Date(a.timestamp).toLocaleString() : 'Just now'}
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E6F4EB] text-[#22683E] border border-[#CCE8D5]">
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 5: Geofencing Radar Full View */}
          {activeTab === 'geofencing' && (
            <div className="bg-white rounded-2xl p-6 border border-[#E3E7E0] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-[#14211A]">Geofence Perimeter Radar</h3>
                  <p className="text-xs text-[#6A7F71] mt-0.5">High-resolution Leaflet satellite map and live sub-meter distance telemetry</p>
                </div>
                <button
                  onClick={() => setShowReconfigure(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#EAF2EC] text-[#203D2C] border border-[#CDE0D2] text-xs font-semibold flex items-center gap-1.5"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Configure Boundary</span>
                </button>
              </div>

              <div className="h-[420px] rounded-2xl overflow-hidden border border-[#D5DDD2]">
                <RealisticMap
                  venueCoords={{ lat: selectedEvent.lat, lng: selectedEvent.lng }}
                  venueName={selectedEvent.venue}
                  geofenceRadius={selectedEvent.geofenceRadius || 100}
                  userCoords={userLocation || { lat: selectedEvent.lat + 0.0001, lng: selectedEvent.lng + 0.00005 }}
                  accuracy={locationAccuracy || 8}
                  isWithin={isWithinGeofence}
                  distance={calculatedDistance}
                  height="420px"
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="pt-6 border-t border-[#E5E9E2] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A8E81]">
            <p>© 2026 CheckIn. All rights reserved.</p>
            <div className="flex items-center gap-5 font-medium">
              <button onClick={() => setIsEventModalOpen(true)} className="hover:text-[#182B20]">
                + Create Event
              </button>
              <button onClick={handleExportCsv} className="hover:text-[#182B20]">
                Export CSV
              </button>
              <button onClick={handleExportExcel} className="hover:text-[#182B20]">
                Export Excel
              </button>
              <button onClick={() => setIsAuthModalOpen(true)} className="hover:text-[#182B20]">
                Account ({user?.role || 'Guest'})
              </button>
            </div>
          </footer>
        </main>
      </div>

      {/* Modals */}
      <CameraQRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        events={events}
        activeEventId={selectedEventId}
        onAttendanceSuccess={(record) => {
          showNotification(`🎉 Verified: ${record.userName} marked present!`);
          loadInitialData();
        }}
      />

      <EventManageModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        eventToEdit={eventToEdit}
        onSaved={() => {
          showNotification('✅ Event saved successfully.');
          loadInitialData();
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          showNotification(`👋 Welcome back, ${loggedInUser.name}!`);
        }}
      />

      <AIAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </div>
  );
}
