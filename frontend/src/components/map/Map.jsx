import { Marker, Popup, Tooltip } from "react-leaflet";
import { useEffect, useState } from "react";
import { publicApiClient } from "../../api";
import BaseMap from "./BaseMap";
import { useNavigate } from "react-router-dom";

const Map = () => {
  const [spots, setSpots] = useState([]);
  const navigate = useNavigate();
  const default_lat = 50.450415530354796;
  const default_lon = 30.524544927812016;
  const [radius, setRadius] = useState(5);
  const [coordinates, setCoordinates] = useState({
    lat: default_lat,
    lon: default_lon,
  });

  const handleUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Geolocation got", latitude, longitude)
        setCoordinates({
          lat: latitude,
          lon: longitude,
        });
      },
      (error) => {
        console.error("Error geting user's position", error);
        alert("Check your geolocation permissions");
      }
    );
  };

  const fetchSpots = async () => {
    try {
      const result = await publicApiClient.get("kebab_spots/spots/", {
        params: {
          lat: coordinates.lat,
          lon: coordinates.lon,
          radius: radius,
        },
      });
      setSpots(result.data.features || []);
    } catch (error) {
      console.error("Error in useEffect which loads points", error);
    }
  };

  useEffect(() => {
    handleUserLocation()
  }, [])

  useEffect(() => {
    fetchSpots();
  }, [radius, coordinates]);

  return (
    <>
      <div>
        <button onClick={handleUserLocation}>My location</button>
        <span>Radius:</span>
        {[5, 10, 30].map((val) => (
          <button 
          key={val} 
          onClick={() => setRadius(val)}
          >
            {val} km
          </button>
        ))}
      </div>
      <BaseMap center={[coordinates.lat, coordinates.lon]}>
        {spots.map((spot) => (
          <Marker
            key={spot.id}
            position={[
              spot.geometry.coordinates[1],
              spot.geometry.coordinates[0],
            ]}
            eventHandlers={{
              click: () => navigate(`/spot_details/${spot.id}/`),
            }}
          >
            <Tooltip>{spot.properties.name}</Tooltip>
          </Marker>
        ))}
      </BaseMap>
    </>
  );
};

export default Map;
