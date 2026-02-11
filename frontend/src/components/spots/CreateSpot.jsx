import { useContext, useState, useEffect } from "react";
import { Marker, useMapEvents } from "react-leaflet";
import BaseMap from "../map/BaseMap";
import { privateApiClient } from "../../api";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";

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
  const { user, loadingAuth } = useContext(AuthContext);
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
  const [photos, setPhotos] = useState([]);
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

    // We create formData because we can't send photos in JSON
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);

    // adding amenities
    Object.keys(amenities).forEach((key) => {
      formData.append(key, amenities[key]);
    });

    // for coordinates we need to send JSON as a string
    formData.append(
      "coordinates",
      JSON.stringify({
        type: "Point",
        coordinates: [position.lng, position.lat],
      }),
    );

    // adding photos
    photos.forEach((photo) => {
      formData.append("photos", photo);
    });

    try {
      await privateApiClient.post("kebab_spots/create_spot/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      navigate("/");
    } catch (error) {
      console.error("Error in SpotCreate(handleSubmit)", error);
      if (error.response?.data?.Photos) {
        setErrorMsg(error.response.data.Photos);
      }
      if (error.response?.status === 401) {
        alert("You are not authorised! Please log in to your account.");
      }
    }
  };

  useEffect(() => {
    if (loadingAuth) {
      return;
    }

    if (!user) {
      return navigate("/login");
    }
  }, [user, loadingAuth]);

  if (loadingAuth) return <p>Loading</p>;
  if (!user) return <p>Loading</p>;

  return (
    <div className="map-layout">
      <div className="map-controls">
        <h2>Add Spot</h2>
        {!position && <p>Click on the map to set the location</p>}
        {errorMsg && <div className="error-message">{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <input
            name="name"
            value={form.name}
            onChange={handleFormChange}
            placeholder="Name of the spot"
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleFormChange}
            placeholder="Description of the spot"
          />
          <label>
            Photos:
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setPhotos(Array.from(e.target.files))}
            />
          </label>
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
          <button type="submit">Save</button>
        </form>
      </div>
      <div className="map-column">
        <BaseMap center={initialCenter}>
          <LocationMarker setPos={setPosition} />
          {position && <Marker position={position} />}
        </BaseMap>
      </div>
    </div>
  );
};

export default CreateSpot;
