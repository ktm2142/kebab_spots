import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";

const RecenterAutomatically = ({ lat, lon }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lon) {
      map.setView([lat, lon]);
    }
  }, [lat, lon, map]);
  return null;
};

const BaseMap = ({ center, style, zoom, children }) => {
  const defaultCenter = [50.62773020039615, 26.20192693252063];
  const lat = center ? center[0] : defaultCenter[0];
  const lon = center ? center[1] : defaultCenter[1];

  return (
    <MapContainer
      center={defaultCenter}
      zoom={zoom || 13}
      style={style || { height: "500px", width: "500px" }}
    >
      <RecenterAutomatically lat={lat} lon={lon} />
      <TileLayer
        attribution="&copy; <a href=https://www.openstreetmap.org.copyright>OpenStreetMap</a> contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </MapContainer>
  );
};

export default BaseMap;
