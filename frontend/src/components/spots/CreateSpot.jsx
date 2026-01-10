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

  const handleFormChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
  // funcrion for updating check mark
  const handleAmenityChange = (amenityName) => {
    setAmenities((prev) => ({
      ...prev,
      [amenityName]: !prev[amenityName],
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
      ...amenities,
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
          onChange={handleFormChange}
          placeholder="Name of point"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleFormChange}
          placeholder="Description of point"
        />
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
