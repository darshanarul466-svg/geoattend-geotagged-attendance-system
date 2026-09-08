/**
 * Haversine Formula Utility for Geolocation Calculation
 * Calculates great-circle distances between two points on a sphere from their longitudes and latitudes.
 */

const EARTH_RADIUS_METERS = 6371000; // Earth mean radius in meters

/**
 * Converts degrees to radians
 * @param {number} degrees 
 * @returns {number} radians
 */
function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Calculates the distance between two coordinates in meters using the Haversine formula.
 * @param {number} lat1 Latitude of point 1
 * @param {number} lon1 Longitude of point 1
 * @param {number} lat2 Latitude of point 2
 * @param {number} lon2 Longitude of point 2
 * @returns {number} Distance in meters rounded to 2 decimal places
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const phi1 = toRadians(lat1);
  const phi2 = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_METERS * c;

  return Math.round(distance * 100) / 100;
}

/**
 * Determines whether a user location falls within the event's geofence radius.
 * @param {object} userCoords { lat: number, lng: number }
 * @param {object} venueCoords { lat: number, lng: number }
 * @param {number} radiusMeters Allowed geofence radius in meters
 * @returns {{ isWithin: boolean, distanceMeters: number, allowedRadius: number }}
 */
function verifyGeofence(userCoords, venueCoords, radiusMeters) {
  if (!userCoords || typeof userCoords.lat !== 'number' || typeof userCoords.lng !== 'number') {
    throw new Error('Invalid user coordinates provided.');
  }

  if (!venueCoords || typeof venueCoords.lat !== 'number' || typeof venueCoords.lng !== 'number') {
    throw new Error('Invalid venue coordinates.');
  }

  const radius = Number(radiusMeters) || 100;
  const distanceMeters = calculateDistance(
    userCoords.lat,
    userCoords.lng,
    venueCoords.lat,
    venueCoords.lng
  );

  return {
    isWithin: distanceMeters <= radius,
    distanceMeters,
    allowedRadius: radius
  };
}

/**
 * Format distance in a human-friendly format
 * @param {number} meters 
 * @returns {string} e.g. "45 m" or "1.32 km"
 */
function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}

module.exports = {
  calculateDistance,
  verifyGeofence,
  formatDistance,
  EARTH_RADIUS_METERS
};
