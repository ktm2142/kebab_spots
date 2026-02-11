import { Marker, Popup } from "react-leaflet";
import BaseMap from "../map/BaseMap";
import { AuthContext } from "../../contexts/AuthContext";
import { useEffect, useMemo, useState, useContext } from "react";
import { privateApiClient } from "../../api";
import { useNavigate, useParams } from "react-router-dom";

/**
 * UpdateSpot - Component for updating an existing kebab spot.
 *
 * Features:
 * - Fetches spot data by ID from the API
 * - Allows editing spot name and description
 * - Displays spot location on map (read-only, coordinates cannot be changed)
 * - Supports deleting the spot
 * - Redirects to spot details page after successful update
 */
const UpdateSpot = () => {
  const { id } = useParams();
  const { user, loadingAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [spotData, setSpotData] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
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

  // Sets loading state during fetch and handles errors gracefully.
  const fetchUserSpotData = async () => {
    try {
      setLoading(true);
      const response = await privateApiClient.get(
        `kebab_spots/spot_update/${id}`,
      );
      setSpotData(response.data);
    } catch (error) {
      console.error("Error in fetchUserSpotData", error);
      setSpotData(null);
    } finally {
      setLoading(false);
    }
  };

  // Fetches spot data from API when component mounts or when spot ID changes.
  useEffect(() => {
    fetchUserSpotData();
  }, [id]);

  useEffect(() => {
    if (loadingAuth) {
      return;
    }

    if (!user) {
      return navigate("/");
    }
  }, [user, loadingAuth]);

  // Populates form fields with spot data once it's loaded from the API.
  // This ensures the form is pre-filled with existing values for editing.
  useEffect(() => {
    if (spotData) {
      setForm({
        name: spotData.properties.name,
        description: spotData.properties.description,
        private_territory: spotData.properties.private_territory,
        shop_nearby: spotData.properties.shop_nearby,
        gazebos: spotData.properties.gazebos,
        near_water: spotData.properties.near_water,
        fishing: spotData.properties.fishing,
        trash_cans: spotData.properties.trash_cans,
        tables: spotData.properties.tables,
        benches: spotData.properties.benches,
        fire_pit: spotData.properties.fire_pit,
        toilet: spotData.properties.toilet,
        car_access: spotData.properties.car_access,
      });
    }
  }, [spotData]);

  /**
   * Converts GeoJSON coordinates [longitude, latitude] to Leaflet format [latitude, longitude].
   * GeoJSON stores coordinates as [lng, lat], but Leaflet expects [lat, lng],
   * so we need to swap them: coordinates[1] is latitude, coordinates[0] is longitude.
   * Memoized to prevent unnecessary recalculations on re-renders.
   */
  const spotCoords = useMemo(() => {
    if (!spotData) return null;
    return [spotData.geometry.coordinates[1], spotData.geometry.coordinates[0]];
  }, [spotData]);

  /**
   * Sends PATCH request to update spot data (name and description).
   * Note: Coordinates cannot be updated - only name and description can be changed.
   * After successful update, redirects to spot details page.
   */
  const updateKebabSpotData = async () => {
    const formData = new FormData();

    // updating amenities
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    // adding photos
    photos.forEach((photo) => {
      formData.append("photos", photo);
    });

    try {
      await privateApiClient.patch(`kebab_spots/spot_update/${id}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      navigate(`/details_spot/${id}`);
    } catch (error) {
      if (error.response?.data?.Photos) {
        setErrorMsg(error.response.data.Photos);
      }
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) {
      return;
    }
    try {
      await privateApiClient.delete(`kebab_spots/delete_photo/${photoId}/`);
      const response = await privateApiClient.get(
        `kebab_spots/spot_update/${id}/`,
      );
      setSpotData(response.data);
    } catch (error) {
      console.error("Error in handleDeletePhoto", error);
    }
  };

  /**
   * Deletes the spot after user confirmation.
   * Shows confirmation dialog before deletion to prevent accidental deletions.
   * Redirects to home page after successful deletion.
   */
  const deleteKebabSpot = async (id) => {
    try {
      if (window.confirm("Are you sure you want to delete this Kebab Spot?")) {
        await privateApiClient.delete(`kebab_spots/spot_update/${id}/`);
        navigate("/");
      }
    } catch (error) {
      console.error("Error in deleteSpot", error);
    }
  };

  // Handles form submission: prevents default form behavior and calls
  // updateKebabSpotData with current form values (name and description only).
  const handleSubmit = (e) => {
    e.preventDefault();
    updateKebabSpotData({
      ...form,
    });
  };

  const handleTextChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleCheboxChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: !prev[e.target.name],
    }));
  };

  if (loadingAuth || loading) return <p>Loading</p>;
  if (!spotData) return <p>Spot was deleted or had too many complaints.</p>;

  return (
    <div className="map-layout">
      <div className="map-controls">
        <h2>{spotData.properties.name}</h2>
        <p>{spotData.properties.description}</p>
        {errorMsg && <div className="error-message">{errorMsg}</div>}
        <form onSubmit={handleSubmit}>
          <input name="name" value={form.name} onChange={handleTextChange} />
          <textarea
            name="description"
            value={form.description}
            onChange={handleTextChange}
          />
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setPhotos(Array.from(e.target.files))}
          />

          <label>
            <input
              type="checkbox"
              name="private_territory"
              checked={form.private_territory}
              onChange={handleCheboxChange}
            />
            Private territory
          </label>
          <label>
            <input
              type="checkbox"
              name="shop_nearby"
              checked={form.shop_nearby}
              onChange={handleCheboxChange}
            />
            Shop nearby
          </label>
          <label>
            <input
              type="checkbox"
              name="gazebos"
              checked={form.gazebos}
              onChange={handleCheboxChange}
            />
            Gazebos
          </label>
          <label>
            <input
              type="checkbox"
              name="near_water"
              checked={form.near_water}
              onChange={handleCheboxChange}
            />
            Near water
          </label>
          <label>
            <input
              type="checkbox"
              name="fishing"
              checked={form.fishing}
              onChange={handleCheboxChange}
            />
            Can fishing
          </label>
          <label>
            <input
              type="checkbox"
              name="trash_cans"
              checked={form.trash_cans}
              onChange={handleCheboxChange}
            />
            Trash cans
          </label>
          <label>
            <input
              type="checkbox"
              name="tables"
              checked={form.tables}
              onChange={handleCheboxChange}
            />
            Tables
          </label>
          <label>
            <input
              type="checkbox"
              name="benches"
              checked={form.benches}
              onChange={handleCheboxChange}
            />
            Benches
          </label>
          <label>
            <input
              type="checkbox"
              name="fire_pit"
              checked={form.fire_pit}
              onChange={handleCheboxChange}
            />
            Fire pit
          </label>
          <label>
            <input
              type="checkbox"
              name="toilet"
              checked={form.toilet}
              onChange={handleCheboxChange}
            />
            Toilet
          </label>
          <label>
            <input
              type="checkbox"
              name="car_access"
              checked={form.car_access}
              onChange={handleCheboxChange}
            />
            Car access
          </label>

          <button type="submit">Save</button>
        </form>
        <button onClick={() => deleteKebabSpot(id)}>Delete Spot</button>
      </div>
      <div className="map-column">
        <BaseMap center={spotCoords} zoom={13}>
          <Marker position={spotCoords}>
            <Popup>{spotData.properties.name}</Popup>
          </Marker>
        </BaseMap>
        {spotData.properties.photos?.length > 0 && (
          <div className="spot-photos">
            <div className="photos-grid">
              {spotData.properties.photos.map((photo) => (
                <div key={photo.id}>
                  <a
                    href={photo.photo}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={photo.photo}
                      alt={`Photo of ${spotData.properties.name}`}
                    />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(photo.id)}
                  >
                    Delete Photo
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateSpot;
