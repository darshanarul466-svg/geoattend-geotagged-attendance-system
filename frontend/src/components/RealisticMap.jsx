import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export default function RealisticMap({
  venueCoords = { lat: 12.9716, lng: 77.5946 },
  venueName = 'Campus Venue',
  geofenceRadius = 100,
  userCoords = null,
  accuracy = 8,
  isWithin = true,
  distance = 12.4,
  height = '240px',
  interactive = true
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map instance if not already created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [venueCoords.lat, venueCoords.lng],
        zoom: 17,
        zoomControl: interactive,
        scrollWheelZoom: interactive,
        dragging: interactive,
        attributionControl: false
      });

      // Add high-resolution, ultra-clean CartoDB Positron map tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      const layerGroup = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
      layerGroupRef.current = layerGroup;
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;

    // Clear previous markers & circles
    layerGroup.clearLayers();

    // 1. Draw Geofence Radius Circle around Venue
    const circleColor = isWithin ? '#2E6B47' : '#D94F4F';
    const geofenceCircle = L.circle([venueCoords.lat, venueCoords.lng], {
      radius: geofenceRadius,
      color: circleColor,
      weight: 2,
      fillColor: circleColor,
      fillOpacity: 0.15,
      dashArray: '4, 6'
    }).addTo(layerGroup);

    // 2. Custom Venue Marker Icon
    const venueIcon = L.divIcon({
      className: 'custom-venue-pin',
      html: `
        <div style="
          background: #182C20;
          color: #ffffff;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #2E6B47;
          box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/>
          </svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    L.marker([venueCoords.lat, venueCoords.lng], { icon: venueIcon })
      .bindPopup(`<b>${venueName}</b><br/>Geofence Radius: ${geofenceRadius}m`)
      .addTo(layerGroup);

    // 3. User Live Marker if provided
    if (userCoords && userCoords.lat && userCoords.lng) {
      const userIcon = L.divIcon({
        className: 'custom-user-dot',
        html: `
          <div style="position: relative; width: 22px; height: 22px;">
            <div style="
              position: absolute;
              inset: 0;
              border-radius: 50%;
              background: #2563EB;
              opacity: 0.4;
              animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <div style="
              position: relative;
              width: 14px;
              height: 14px;
              margin: 4px;
              border-radius: 50%;
              background: #2563EB;
              border: 2.5px solid #ffffff;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            "></div>
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11]
      });

      L.marker([userCoords.lat, userCoords.lng], { icon: userIcon })
        .bindPopup(`<b>Your Live Position</b><br/>Distance to Venue: ${distance}m`)
        .addTo(layerGroup);

      // Distance Line between User and Venue
      L.polyline(
        [
          [venueCoords.lat, venueCoords.lng],
          [userCoords.lat, userCoords.lng]
        ],
        {
          color: isWithin ? '#2E6B47' : '#D94F4F',
          weight: 2,
          dashArray: '5, 5',
          opacity: 0.7
        }
      ).addTo(layerGroup);

      // Accuracy circle around user
      if (accuracy) {
        L.circle([userCoords.lat, userCoords.lng], {
          radius: Math.max(accuracy, 5),
          color: '#2563EB',
          weight: 1,
          fillColor: '#3B82F6',
          fillOpacity: 0.1
        }).addTo(layerGroup);
      }
    }

    // Adjust view bounds to show both venue and user
    if (userCoords) {
      const bounds = L.latLngBounds([
        [venueCoords.lat, venueCoords.lng],
        [userCoords.lat, userCoords.lng]
      ]);
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 18 });
    } else {
      map.setView([venueCoords.lat, venueCoords.lng], 17);
    }

    // Invalidate size in case of tab/modal resize
    setTimeout(() => {
      if (map) map.invalidateSize();
    }, 200);

  }, [venueCoords, venueName, geofenceRadius, userCoords, accuracy, isWithin, distance, interactive]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-[#D5DDD2] shadow-inner bg-[#EBF0E8]">
      <div ref={mapContainerRef} style={{ height, width: '100%' }} />
      
      {/* Floating Status Badge */}
      <div className="absolute top-2.5 right-2.5 z-[1000] bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-sm border border-[#D5DDD2] text-[11px] font-semibold flex items-center gap-1.5 text-[#182C20]">
        <span className={`w-2 h-2 rounded-full ${isWithin ? 'bg-[#2E6B47]' : 'bg-[#D94F4F] animate-ping'}`} />
        <span>{isWithin ? 'Within Geofence' : 'Outside Boundary'}</span>
      </div>

      {/* Floating Coordinates Pill */}
      <div className="absolute bottom-2 left-2.5 z-[1000] bg-[#121B16]/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[10px] font-mono border border-[#2B3B30] flex items-center gap-2">
        <span>📍 {venueCoords.lat.toFixed(4)}° N, {venueCoords.lng.toFixed(4)}° E</span>
        <span className="text-[#89A392]">|</span>
        <span className="text-emerald-400 font-bold">{geofenceRadius}m radius</span>
      </div>
    </div>
  );
}
