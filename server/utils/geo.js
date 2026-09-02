const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees) => degrees * (Math.PI / 180);

export const isValidCoordinate = (latitude, longitude) => (
  Number.isFinite(latitude)
  && Number.isFinite(longitude)
  && latitude >= -90
  && latitude <= 90
  && longitude >= -180
  && longitude <= 180
);

export const haversineDistanceKm = (first, second) => {
  const latitudeDelta = toRadians(second.lat - first.lat);
  const longitudeDelta = toRadians(second.lng - first.lng);
  const firstLatitude = toRadians(first.lat);
  const secondLatitude = toRadians(second.lat);

  const haversine = (
    Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(firstLatitude)
      * Math.cos(secondLatitude)
      * Math.sin(longitudeDelta / 2) ** 2
  );

  return EARTH_RADIUS_KM * 2 * Math.atan2(
    Math.sqrt(haversine),
    Math.sqrt(1 - haversine)
  );
};

export const geoPoint = (latitude, longitude) => ({
  type: 'Point',
  coordinates: [longitude, latitude]
});

export const coordinatesFromGeoPoint = (point) => ({
  lat: point?.coordinates?.[1],
  lng: point?.coordinates?.[0]
});
