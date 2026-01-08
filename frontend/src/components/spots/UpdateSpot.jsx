import { Marker, Popup } from "react-leaflet";
import BaseMap from "../map/BaseMap";
import { useEffect, useMemo, useState } from "react";
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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [spotData, setSpotData] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  // Fetches spot data from API when component mounts or when spot ID changes.
  // Sets loading state during fetch and handles errors gracefully.
  useEffect(() => {
    const fetchUserSpotData = async () => {
      try {
        setLoading(true);
        const response = await privateApiClient.get(
          `kebab_spots/spot_update/${id}`
        );
        setSpotData(response.data);
      } catch (error) {
        console.error("Error in fetchUserSpotData", error);
        setSpotData(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUserSpotData();
  }, [id]);

  // Populates form fields with spot data once it's loaded from the API.
  // This ensures the form is pre-filled with existing values for editing.
  useEffect(() => {
    if (spotData) {
      setForm({
        name: spotData.properties.name,
        description: spotData.properties.description,
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
  const updateKebabSpotData = async (data) => {
    try {
      await privateApiClient.patch(`kebab_spots/spot_update/${id}/`, data);
      navigate(`/details_spot/${id}`);
    } catch (error) {
      console.error("Error in updateKebabSpotData", error);
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
      name: form.name,
      description: form.description,
    });
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  if (loading) return <p>Loading...</p>;
  if (!spotData) return <p>Spot was deleted or had too many complaints.</p>;

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input name="name" value={form.name} onChange={handleChange} />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
        />

        <button type="submit">Save</button>
      </form>

      <h2>{spotData.properties.name}</h2>
      <p>{spotData.properties.description}</p>
      <button onClick={() => deleteKebabSpot(id)}>Delete Spot</button>
      <BaseMap center={spotCoords} zoom={13}>
        <Marker position={spotCoords}>
          <Popup>{spotData.properties.name}</Popup>
        </Marker>
      </BaseMap>
    </div>
  );
};

export default UpdateSpot;
