import { useState } from "react";
import { Marker, useMapEvents } from "react-leaflet";
import BaseMap from "../map/BaseMap";
import { privateApiClient } from "../../api";
import { useLocation, useNavigate } from "react-router-dom";

/**
 * LocationMarker - A component that handles map click events to set spot position.
 * Listens to map clicks and updates the position state with the clicked coordinates.
 * Returns null as it doesn't render any visible UI elements.
 */
const LocationMarker = ({ setPos }) => {
  useMapEvents({
    click(e) {
      setPos(e.latlng);
    },
  });
  return null;
};

/**
 * CreateSpot - Component for creating a new kebab spot.
 *
 * Features:
 * - Allows user to click on map to set spot location
 * - Form for entering spot name and description
 * - Preserves map position from previous view (if navigated from Map component)
 * - Sends POST request to create spot via private API
 */
const CreateSpot = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Get the map center position passed from Map component via navigation state.
  // This allows the map to start at the same position the user was viewing
  // when they clicked "Create Kebab Spot" button.
  const initialCenter = location.state?.lastCenter;
  const [position, setPosition] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handles form submission: validates position, formats data in GeoJSON format,
  // and sends POST request to create the spot. Redirects to home on success.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position) {
      alert("Please put a dot on the map!");
      return;
    }

    const kebabSpotData = {
      name: form.name,
      description: form.description,
      coordinates: {
        type: "Point",
        // GeoJSON format requires [longitude, latitude] order (opposite of Leaflet's [lat, lng])
        // position.latlng from Leaflet has .lat and .lng properties, so we swap them here
        coordinates: [position.lng, position.lat],
      },
    };

    try {
      await privateApiClient.post("kebab_spots/create_spot/", kebabSpotData);
      navigate("/");
    } catch (error) {
      console.error("Error in SpotCreate(handleSubmit)", error);
      if (error.response?.status === 401) {
        alert("You are not authorised! Please log in to your account.");
      }
    }
  };

  return (
    <div>
      <h1>Add Spot</h1>

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name of point"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description of point"
        />

        <button type="submit">Save</button>
      </form>

      <p>Click on the map to set the location</p>

      <BaseMap center={initialCenter}>
        <LocationMarker setPos={setPosition} />
        {position && <Marker position={position} />}
      </BaseMap>

      {position && (
        <p>
          Chosen coordinates: {position.lat}, {position.lng}
        </p>
      )}
    </div>
  );
};

export default CreateSpot;
