import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Icon fix Leaflet after building Vite
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

/**
 * ChangeMapLocation - A component that updates the map view when center prop changes.
 *
 * Why this component is needed:
 * - MapContainer's 'center' prop only sets initial position and doesn't update
 *   when the prop changes. This component listens to center changes and manually
 *   updates the map view using map.setView().
 *
 * Why 'map' is in dependencies:
 * - The map instance can change between renders, so we need to include it in
 *   dependencies to ensure the effect works correctly with the current map instance.
 *
 * Used for: Dynamically centering the map when user gets geolocation, searches
 * for a location, or navigates from another component.
 */
const ChangeMapLocation = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]); // map in dependencies too because instance of map changing
  return null;
};

/**
 * BaseMap - Reusable map component wrapper for Leaflet maps.
 *
 * This is a base component used across the application (Map, CreateSpot, UpdateSpot, etc.)
 * to display interactive maps with consistent styling and behavior.
 *
 * Props:
 * - center: [latitude, longitude] - Map center coordinates (optional, uses default if not provided)
 * - zoom: number - Initial zoom level (optional, defaults to 13)
 * - style: object - Custom CSS styles for map container (optional)
 * - children: ReactNode - Child components to render on the map (Markers, Popups, etc.)
 *
 * Features:
 * - Uses OpenStreetMap tiles
 * - Automatically updates map center when center prop changes
 * - Provides sensible defaults for zoom and styling
 */
const BaseMap = ({ center, style, zoom, children }) => {
  /**
   * Memoized map center coordinates.
   *
   * Why useMemo:
   * - Prevents unnecessary recalculations on every render
   * - Only recalculates when 'center' prop actually changes
   *
   * Default fallback:
   * - Uses default coordinates if center is not provided (e.g., when user
   *   denies geolocation permission or component is used without center prop)
   */
  const mapCenter = useMemo(() => {
    const defaultCenter = [50.62773020039615, 26.20192693252063]; // Default coordinates (Kyiv)
    return center || defaultCenter; // Uses default coordinates if user doesn't allow his geolocation, or uses user geolocation coordinates
  }, [center]);

  return (
    <MapContainer
      center={mapCenter}
      zoom={zoom || 13}
      style={style || { height: "500px", width: "100%" }}
    >
      {/* Dynamically updates map center when center prop changes */}
      <ChangeMapLocation center={mapCenter} zoom={zoom} />
      {/* OpenStreetMap tile layer - provides the actual map imagery */}
      <TileLayer
        attribution="&copy; <a href=https://www.openstreetmap.org.copyright>OpenStreetMap</a> contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </MapContainer>
  );
};

export default BaseMap;
