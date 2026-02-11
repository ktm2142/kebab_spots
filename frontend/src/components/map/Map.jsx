import { Marker, Tooltip, useMapEvents } from "react-leaflet";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { publicApiClient } from "../../api";
import BaseMap from "./BaseMap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

/**
 * MapTracker - A component that tracks the map center position.
 * Listens to the map's 'moveend' event and updates the centerRef
 * with the current map center coordinates whenever the user moves the map.
 * This allows preserving the last map position for use in other components
 * (e.g., when creating a new spot at the current map view).
 */
const MapTracker = ({ setCenterRef }) => {
  useMapEvents({
    moveend: (e) => {
      const { lat, lng } = e.target.getCenter();
      setCenterRef.current = [lat, lng];
    },
  });
  return null;
};

const Map = () => {
  const [spots, setSpots] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const default_lat = 50.450415530354796; // Default coordinates for Kyiv, Ukraine (used as fallback initial map center)
  const default_lon = 30.524544927812016;
  const [radius, setRadius] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [coordinates, setCoordinates] = useState({
    lat: default_lat,
    lon: default_lon,
  });
  const [errorMsg, setErrorMsg] = useState(null);
  const [amenities, setAmenities] = useState({
    private_territory: false,
    shop_nearby: false,
    gazebos: false,
    near_water: false,
    fishing: false,
    trash_cans: false,
    tables: false,
    benches: false,
    fire_pit: false,
    toilet: false,
    car_access: false,
  });
  const [rating, setRating] = useState("");
  /**
   * lastMapPosition - A ref that stores the last known map center position.
   *
   * Why useRef instead of useState:
   * - The map center can change frequently as the user drags the map around.
   *   Using useState would trigger re-renders on every map movement, causing
   *   performance issues and unnecessary component updates.
   * - useRef allows us to store and update the position without causing re-renders,
   *   which is perfect for tracking values that need to be current but don't need
   *   to trigger UI updates.
   * - We only need this value when navigating to the CreateSpot component, so
   *   we don't need it to be part of the component's reactive state.
   *
   * How it's updated:
   * - Automatically updated via MapTracker component whenever the user finishes
   *   moving the map (on 'moveend' event).
   * - Also synced with the coordinates state in useEffect to ensure consistency
   *   when coordinates change due to search or geolocation.
   *
   * Where it's used:
   * - Passed to CreateSpot component via navigation state (as 'lastCenter') when
   *   user clicks "Create Kebab Spot" button. This allows the CreateSpot component
   *   to initialize its map view at the same position the user was viewing on the
   *   main map, providing a seamless user experience.
   */
  const lastMapPosition = useRef([default_lat, default_lon]);

  // Wrapper to convert geolocation API callback-based API to Promise-based
  // Makes it easier to use with async/await syntax
  const getPosition = (options) => {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  };

  // Memoized to prevent unnecessary re-renders of BaseMap component.
  // Only recalculates when coordinates actually change.
  const mapCenter = useMemo(() => {
    return [coordinates.lat, coordinates.lon];
  }, [coordinates.lat, coordinates.lon]);

  const handleUserLocation = async () => {
    console.log("Getting geolocation");
    const options = {
      timeout: 10000, // for showing error after NOT getting geolocation for 10 sec
      maximumAge: 60000, // Cashing geolocation for 1 minute
    };
    try {
      const position = await getPosition(options);
      const { latitude, longitude } = position.coords;
      console.log("Geolocation got", latitude, longitude);
      setCoordinates({
        lat: latitude,
        lon: longitude,
      });
    } catch (error) {
      console.error("Error geting user's position", error);
      alert("Check your geolocation permissions or use search");
    }
  };

  // funcrion for updating check mark
  const handleAmenityChange = (amenityName) => {
    setAmenities((prev) => ({
      ...prev,
      [amenityName]: !prev[amenityName],
    }));
  };

  const fetchSpots = async () => {
    try {
      const params = {
        lat: coordinates.lat,
        lon: coordinates.lon,
        radius: radius,
      };
      if (rating) {
        params.min_rating = rating;
      }
      Object.keys(amenities).forEach((key) => {
        if (amenities[key]) {
          params[key] = "true";
        }
      });
      const result = await publicApiClient.get("kebab_spots/spots/", {
        params,
      });
      setSpots(result.data.features || []);
    } catch (error) {
      console.error("Error in useEffect which loads points", error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setErrorMsg(null)
    try {
      const response = await publicApiClient.get("kebab_spots/search/", {
        params: {
          location: searchQuery,
          radius: radius,
        },
      });
      const { lat, lon } = response.data.location;
      setCoordinates({
        lat: parseFloat(lat),
        lon: parseFloat(lon),
      });
    } catch (error) {
      if (error.response?.data) {
        setErrorMsg(error.response.data["error"]);
      }
      if (error.response?.status === 404) {
        setErrorMsg("Location didn't found");
      } else {
        console.error("Error in handleSearch", error);
      }
    }
  };

  const handleCreateSpot = () => {
    if (!user) {
      navigate("/login");
      return;
    }
    navigate("/create_spot", {
      state: {
        lastCenter: lastMapPosition.current,
      },
    });
  };

  // Sync lastMapPosition ref whenever coordinates state changes
  // (e.g., after search or geolocation update)
  useEffect(() => {
    lastMapPosition.current = [coordinates.lat, coordinates.lon];
  }, [coordinates]);

  // Get user's current location on component mount
  useEffect(() => {
    handleUserLocation();
  }, []);

  // Fetch spots whenever coordinates change
  useEffect(() => {
    fetchSpots();
  }, [coordinates]);

  return (
    <div className="map-layout">
      <div className="map-controls">
        <button onClick={handleUserLocation}>My Location</button>
        <button onClick={handleCreateSpot}>Create Kebab Spot</button>

        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Enter city, town or village"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {errorMsg && <div className="error-message">{errorMsg}</div>}
          <button type="submit">Search</button>
        </form>
        <span>Radius of visible spots:</span>
        <select
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
        >
          {[5, 10, 30].map((val) => (
            <option key={val} value={val}>
              {val} km
            </option>
          ))}
        </select>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchSpots();
          }}
        >
          <h3>Filter</h3>
          <label>
            Minimal rating:
            <select value={rating} onChange={(e) => setRating(e.target.value)}>
              <option value="">All ratings</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </label>
          <br />
          <div className="amenities-grid">
            <label>
              <input
                type="checkbox"
                checked={amenities.private_territory}
                onChange={() => handleAmenityChange("private_territory")}
              />
              Private territory
            </label>
            <label>
              <input
                type="checkbox"
                checked={amenities.shop_nearby}
                onChange={() => handleAmenityChange("shop_nearby")}
              />
              Shop nearby
            </label>
            <label>
              <input
                type="checkbox"
                checked={amenities.gazebos}
                onChange={() => handleAmenityChange("gazebos")}
              />
              Gazebos
            </label>
            <label>
              <input
                type="checkbox"
                checked={amenities.near_water}
                onChange={() => handleAmenityChange("near_water")}
              />
              Near water
            </label>
            <label>
              <input
                type="checkbox"
                checked={amenities.fishing}
                onChange={() => handleAmenityChange("fishing")}
              />
              Fishing
            </label>
            <label>
              <input
                type="checkbox"
                checked={amenities.trash_cans}
                onChange={() => handleAmenityChange("trash_cans")}
              />
              Trash cans
            </label>
            <label>
              <input
                type="checkbox"
                checked={amenities.tables}
                onChange={() => handleAmenityChange("tables")}
              />
              Tables
            </label>
            <label>
              <input
                type="checkbox"
                checked={amenities.benches}
                onChange={() => handleAmenityChange("benches")}
              />
              Benches
            </label>
            <label>
              <input
                type="checkbox"
                checked={amenities.fire_pit}
                onChange={() => handleAmenityChange("fire_pit")}
              />
              Fire pit
            </label>
            <label>
              <input
                type="checkbox"
                checked={amenities.toilet}
                onChange={() => handleAmenityChange("toilet")}
              />
              Toilet
            </label>
            <label>
              <input
                type="checkbox"
                checked={amenities.car_access}
                onChange={() => handleAmenityChange("car_access")}
              />
              Car access
            </label>
          </div>
          <button type="submit">Apply filter</button>
        </form>
      </div>

      <div className="map-column">
        <BaseMap center={mapCenter}>
          <MapTracker setCenterRef={lastMapPosition} />
          {spots.map((spot) => (
            <Marker
              key={spot.id}
              position={[
                // GeoJSON uses [longitude, latitude] format, but Leaflet expects [latitude, longitude]
                // So we need to swap the coordinates: coordinates[1] is lat, coordinates[0] is lon
                spot.geometry.coordinates[1],
                spot.geometry.coordinates[0],
              ]}
              eventHandlers={{
                click: () => navigate(`/details_spot/${spot.id}/`),
              }}
            >
              <Tooltip>
                {spot.properties.name}
                <br />
                Rating: {spot.properties.average_rating}
              </Tooltip>
            </Marker>
          ))}
        </BaseMap>
      </div>
    </div>
  );
};

export default Map;
