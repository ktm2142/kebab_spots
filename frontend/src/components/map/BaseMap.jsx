import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

// Changing map position to current location of user
const ChangeMapLocation = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center);
    }
  }, [center, map]); // map in dependencies too because instance of map changing
  return null;
};

const BaseMap = ({ center, style, zoom, children }) => {
  const defaultCenter = [50.62773020039615, 26.20192693252063]; // Default coordinates (Kyiv)
  const givenCenter = center || defaultCenter; // Uses default coordinates if user doesn't allow his geolocation, or uses user geolocation coordinates

  return (
    <MapContainer
      center={givenCenter}
      zoom={zoom || 13}
      style={style || { height: "500px", width: "500px" }}
    >
      <ChangeMapLocation center={givenCenter}/>
      <TileLayer
        attribution="&copy; <a href=https://www.openstreetmap.org.copyright>OpenStreetMap</a> contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </MapContainer>
  );
};

export default BaseMap;
