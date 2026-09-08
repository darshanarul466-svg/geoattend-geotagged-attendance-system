import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Navigation,
  Compass,
  ShieldCheck,
  Building,
  CheckCircle2,
  AlertCircle,
  Sliders,
  ArrowRight,
  Sparkles,
  KeyRound,
  User,
  Mail,
  Lock
} from 'lucide-react';
import L from 'leaflet';
import { api } from '../services/api';

export default function OneTimeSetupPage({ onSetupComplete }) {
  // Setup Form State
  const [institutionName, setInstitutionName] = useState('Campus Attendance Management System');
  const [venueName, setVenueName] = useState('Grand Central Auditorium');
  const [lat, setLat] = useState(12.9716);
  const [lng, setLng] = useState(77.5946);
  const [geofenceRadius, setGeofenceRadius] = useState(100);
  const [accuracyRating, setAccuracyRating] = useState(null);

  // Master Admin Credentials
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // UI States
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsStatusMsg, setGpsStatusMsg] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Map references
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);

  // Initialize interactive Leaflet map with click/touch configuration
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [lat, lng],
        zoom: 16,
        attributionControl: false
      });

      // High-resolution clean CartoDB Voyager tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      // Custom venue pin icon
      const venuePinIcon = L.divIcon({
        className: 'setup-pin',
        html: `
          <div style="
            background: #182C20;
            color: #ffffff;
            width: 36px;
            height: 36px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid #34D399;
            box-shadow: 0 4px 14px rgba(0,0,0,0.35);
            cursor: grab;
          ">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="2.5"/>
            </svg>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });

      // Marker & Geofence Circle
      const marker = L.marker([lat, lng], {
        icon: venuePinIcon,
        draggable: true
      }).addTo(map);

      const circle = L.circle([lat, lng], {
        radius: geofenceRadius,
        color: '#2E6B47',
        fillColor: '#2E6B47',
        fillOpacity: 0.18,
        weight: 2,
        dashArray: '5, 5'
      }).addTo(map);

      markerRef.current = marker;
      circleRef.current = circle;
      mapInstanceRef.current = map;

      // Map Click / Touch listener for intuitive pin placement
      map.on('click', (e) => {
        const newLat = Number(e.latlng.lat.toFixed(6));
        const newLng = Number(e.latlng.lng.toFixed(6));
        setLat(newLat);
        setLng(newLng);
        marker.setLatLng([newLat, newLng]);
        circle.setLatLng([newLat, newLng]);
        setGpsStatusMsg('📍 Point updated via map touch / click');
      });

      // Marker Drag listener
      marker.on('dragend', (e) => {
        const pos = e.target.getLatLng();
        const newLat = Number(pos.lat.toFixed(6));
        const newLng = Number(pos.lng.toFixed(6));
        setLat(newLat);
        setLng(newLng);
        circle.setLatLng([newLat, newLng]);
        setGpsStatusMsg('📍 Point updated via marker drag');
      });
    }

    // Force map to adapt to dynamic layout bounds
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);
  }, []);

  // Sync marker and geofence circle when coords or radius change
  useEffect(() => {
    if (markerRef.current && circleRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([lat, lng]);
      circleRef.current.setLatLng([lat, lng]);
      circleRef.current.setRadius(geofenceRadius);
    }
  }, [lat, lng, geofenceRadius]);

  // 1-Click Live GPS Auto-Detection with live accuracy rating
  const handleAutoDetectGps = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setIsDetectingGps(true);
    setGpsStatusMsg('Acquiring high-accuracy GPS satellite fix...');
    setErrorMsg(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const detectedLat = Number(position.coords.latitude.toFixed(6));
        const detectedLng = Number(position.coords.longitude.toFixed(6));
        const acc = Math.round(position.coords.accuracy);

        setLat(detectedLat);
        setLng(detectedLng);
        setAccuracyRating(acc);
        setIsDetectingGps(false);
        setGpsStatusMsg(`🎯 High-Accuracy GPS locked! Accuracy: ±${acc}m`);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([detectedLat, detectedLng], 17);
        }
      },
      (err) => {
        setIsDetectingGps(false);
        let msg = 'Failed to retrieve location.';
        if (err.code === 1) msg = 'Location permission denied by user.';
        else if (err.code === 2) msg = 'Location unavailable or weak GPS signal.';
        else if (err.code === 3) msg = 'Location acquisition timed out.';
        setErrorMsg(msg);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  // Submit Configuration
  const handleSaveConfiguration = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        institutionName: institutionName.trim(),
        venueName: venueName.trim(),
        lat: Number(lat),
        lng: Number(lng),
        geofenceRadius: Number(geofenceRadius),
        accuracyRating: accuracyRating || 8,
        adminName: adminName.trim() || 'Administrator',
        adminEmail: adminEmail.trim(),
        adminPassword: adminPassword || ''
      };

      const res = await api.config.setup(payload);
      if (res.success) {
        onSetupComplete(res.config);
      } else {
        throw new Error(res.message || 'Configuration failed');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Could not save configuration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col lg:flex-row bg-[#F5F7F4] text-[#192620] selection:bg-[#234A35] selection:text-white">
      {/* Left Column: Atmospheric Setup Brand & Map Visualizer */}
      <div className="lg:w-7/12 bg-[#121B16] text-[#A6B8AE] p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#22382B] flex items-center justify-center text-white shadow-lg border border-[#2F4D3B]">
              <Compass className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight leading-none">CheckIn</h1>
              <p className="text-[10px] uppercase tracking-wider text-[#6A8275] font-semibold mt-1">
                One-Time System Initialization
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#1C2C22] border border-[#2D4536] text-[11px] font-mono text-emerald-400 font-semibold">
            First-Time Setup
          </span>
        </div>

        {/* Center: Live Interactive Leaflet Map for Touch/Click Setting */}
        <div className="relative z-10 my-8 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Interactive Geofence Boundary Preview</h3>
            </div>
            <span className="text-[11px] text-[#7A9684] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Click or touch anywhere on the map to pin</span>
            </span>
          </div>

          {/* Interactive Map Container */}
          <div className="relative w-full h-[320px] rounded-2xl overflow-hidden border border-[#263D2E] shadow-2xl">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Floating Telemetry Box */}
            <div className="absolute top-3 left-3 z-[1000] bg-[#121B16]/90 backdrop-blur-md px-3 py-2 rounded-xl text-white text-xs border border-[#2B4333] shadow-lg space-y-1">
              <p className="text-[10px] text-[#86A391] uppercase tracking-wider font-semibold">
                Venue Geographic Coordinates
              </p>
              <div className="font-mono text-emerald-300 font-bold flex items-center gap-2">
                <span>{lat.toFixed(6)}° N, {lng.toFixed(6)}° E</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-white/80 pt-0.5">
                <span>Radius: <strong className="text-white">{geofenceRadius}m</strong></span>
                {accuracyRating && (
                  <span className="text-emerald-400 font-semibold">• Accuracy: ±{accuracyRating}m</span>
                )}
              </div>
            </div>
          </div>

          {/* Live GPS Status feedback */}
          {gpsStatusMsg && (
            <div className="p-2.5 rounded-xl bg-[#1C2E22] border border-[#2C4835] text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{gpsStatusMsg}</span>
            </div>
          )}
        </div>

        {/* Footer Notes */}
        <div className="relative z-10 text-[11px] text-[#63796D] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t border-[#1C2B21] pt-4">
          <p>This configuration will be permanently saved to your system database.</p>
          <p className="font-mono text-[#829989]">Haversine Sub-Meter Verification Ready</p>
        </div>
      </div>

      {/* Right Column: Configuration Form */}
      <div className="lg:w-5/12 p-6 sm:p-10 flex flex-col justify-center overflow-y-auto">
        <div className="w-full max-w-lg mx-auto space-y-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-[#14261C]">
              Configure Campus & Geofence
            </h2>
            <p className="text-xs text-[#6B8073] mt-1.5 leading-relaxed">
              Define your campus, primary venue coordinates, and security perimeter. All student and
              faculty check-ins will be validated against this boundary.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-[#FDF0F0] border border-[#F7C6C6] text-xs text-[#B83232] font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#B83232]" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveConfiguration} className="space-y-4 text-left">
            {/* Institution / Campus Name */}
            <div>
              <label className="block text-xs font-semibold text-[#32493A] mb-1">
                Institution or Campus Name *
              </label>
              <div className="relative">
                <Building className="w-4 h-4 absolute left-3 top-2.5 text-[#7E9687]" />
                <input
                  type="text"
                  required
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="e.g. National Science & Tech Campus"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#DCE4DA] rounded-xl text-xs text-[#16291E] focus:outline-none focus:border-[#203D2C] shadow-sm font-medium"
                />
              </div>
            </div>

            {/* Primary Venue Name */}
            <div>
              <label className="block text-xs font-semibold text-[#32493A] mb-1">
                Primary Venue / Hall Name *
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-[#7E9687]" />
                <input
                  type="text"
                  required
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="e.g. Main Auditorium / CSE Lab 301"
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#DCE4DA] rounded-xl text-xs text-[#16291E] focus:outline-none focus:border-[#203D2C] shadow-sm font-medium"
                />
              </div>
            </div>

            {/* 1-Click Auto-Detect Live GPS Button */}
            <div className="p-3.5 rounded-2xl bg-[#EAF2EC] border border-[#CDE0D2] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#1E3B29] uppercase tracking-wider">
                  📍 Auto-Detect Live GPS
                </span>
                {accuracyRating && (
                  <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                    Accuracy: ±{accuracyRating}m
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#556E5D] leading-relaxed">
                Automatically read your device's high-precision GPS coordinates and place the venue pin right where you stand.
              </p>
              <button
                type="button"
                onClick={handleAutoDetectGps}
                disabled={isDetectingGps}
                className="w-full py-2.5 px-3 rounded-xl bg-[#203D2C] hover:bg-[#284E38] text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Navigation className={`w-4 h-4 text-emerald-300 ${isDetectingGps ? 'animate-spin' : ''}`} />
                <span>{isDetectingGps ? 'Detecting high-precision GPS...' : '📍 Auto-Detect My Live Location'}</span>
              </button>
            </div>

            {/* Manual Lat / Lng inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#32493A] mb-1">
                  Latitude (° N)
                </label>
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={lat}
                  onChange={(e) => setLat(Number.parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-[#DCE4DA] rounded-xl text-xs text-[#16291E] font-mono focus:outline-none focus:border-[#203D2C] shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#32493A] mb-1">
                  Longitude (° E)
                </label>
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={lng}
                  onChange={(e) => setLng(Number.parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-[#DCE4DA] rounded-xl text-xs text-[#16291E] font-mono focus:outline-none focus:border-[#203D2C] shadow-sm"
                />
              </div>
            </div>

            {/* Geofence Radius Slider */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-semibold text-[#32493A]">
                <div className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#203D2C]" />
                  <span>Geofence Radius Perimeter</span>
                </div>
                <span className="font-mono text-emerald-800 font-bold bg-[#EAF2EC] px-2 py-0.5 rounded-md">
                  {geofenceRadius} meters
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                step="10"
                value={geofenceRadius}
                onChange={(e) => setGeofenceRadius(Number(e.target.value))}
                className="w-full accent-[#203D2C] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#7E9687]">
                <span>20m (Strict Classroom)</span>
                <span>100m (Auditorium)</span>
                <span>500m (Entire Campus)</span>
              </div>
            </div>

            {/* Administrator Account (Optional / Recommended) */}
            <div className="pt-3 border-t border-[#E3E8E1] space-y-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#203D2C]" />
                <h4 className="text-xs font-bold text-[#1E3628]">Administrator Account (Optional)</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-[#465E50] mb-0.5">
                    Admin Name
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#8CA395]" />
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      placeholder="e.g. Dr. Arthur Smith"
                      className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-[#DCE4DA] rounded-lg text-xs text-[#16291E] focus:outline-none focus:border-[#203D2C]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#465E50] mb-0.5">
                    Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#8CA395]" />
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@campus.edu"
                      className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-[#DCE4DA] rounded-lg text-xs text-[#16291E] focus:outline-none focus:border-[#203D2C]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#465E50] mb-0.5">
                  Admin Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#8CA395]" />
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="•••••••• (optional, default demo accounts also available)"
                    className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-[#DCE4DA] rounded-lg text-xs text-[#16291E] focus:outline-none focus:border-[#203D2C]"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-[#203D2C] hover:bg-[#284E38] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              <span>{isSubmitting ? 'Saving Configuration...' : 'Save & Proceed to Login'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
