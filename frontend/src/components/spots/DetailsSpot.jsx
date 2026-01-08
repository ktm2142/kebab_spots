import { Marker, Popup } from "react-leaflet";
import BaseMap from "../map/BaseMap";
import { Link, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { publicApiClient } from "../../api";
import { AuthContext } from "../../contexts/AuthContext";

/**
 * DetailsSpot - Component for displaying detailed information about a kebab spot.
 *
 * Features:
 * - Fetches and displays spot details by ID from the API
 * - Shows spot location on an interactive map
 * - Displays spot name and description
 * - Shows "Update Spot" button only if the current user is the spot owner
 * - Handles loading and error states gracefully
 */
const DetailsSpot = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [spot, setSpot] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * Fetches spot details from the API when component mounts or when spot ID changes.
   *
   * Handles:
   * - Loading state management
   * - Error handling (sets spot to null on error)
   * - Uses public API endpoint (no authentication required)
   */
  useEffect(() => {
    const fetchSpotDetails = async () => {
      try {
        setLoading(true);
        const result = await publicApiClient.get(
          `kebab_spots/spot_detail/${id}/`
        );
        setSpot(result.data);
      } catch (error) {
        console.error("Error in fetchSpotDetails", error);
        setSpot(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSpotDetails();
  }, [id]);

  // Show loading indicator while fetching spot data
  if (loading) return <p>Loading...</p>;
  // Show error message if spot doesn't exist (deleted or too many complaints)
  if (!spot) return <p>Spot was deleted or had too many complaints.</p>;

  /**
   * Converts GeoJSON coordinates [longitude, latitude] to Leaflet format [latitude, longitude].
   *
   * GeoJSON format: [longitude, latitude] (coordinates[0] = lng, coordinates[1] = lat)
   * Leaflet format: [latitude, longitude] (first element = lat, second = lng)
   *
   * Therefore we swap: coordinates[1] (lat) goes first, coordinates[0] (lng) goes second.
   */
  const spotCoords = [
    spot.geometry.coordinates[1],
    spot.geometry.coordinates[0],
  ];
  /**
   * Checks if the current logged-in user is the owner of this spot.
   *
   * Conditions:
   * - user must be logged in (user exists)
   * - spot.properties.user must match user.id
   *
   * Used to conditionally show the "Update Spot" button only to the spot owner.
   */
  const isOwner = user && spot.properties.user === user.id;

  return (
    <div>
      {/* Only show "Update Spot" button if current user is the spot owner */}
      {isOwner && (
        <Link to={`/update_spot/${id}/`}>
          <button>Update Spot</button>
        </Link>
      )}
      <h2>{spot.properties.name}</h2>
      <p>{spot.properties.description}</p>
      <BaseMap center={spotCoords} zoom={13}>
        <Marker position={spotCoords}>
          <Popup>{spot.properties.name}</Popup>
        </Marker>
      </BaseMap>
    </div>
  );
};

export default DetailsSpot;
