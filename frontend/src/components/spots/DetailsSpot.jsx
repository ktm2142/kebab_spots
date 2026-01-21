import { Marker, Popup } from "react-leaflet";
import BaseMap from "../map/BaseMap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { privateApiClient, publicApiClient } from "../../api";
import { AuthContext } from "../../contexts/AuthContext";
import "../../styles/rating.css";

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
  const navigate = useNavigate();
  const [spot, setSpot] = useState(null);
  const [ratingNumber, setRatingNumber] = useState(null);
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
        const client = user ? privateApiClient : publicApiClient;
        const result = await client.get(`kebab_spots/spot_detail/${id}/`);
        setSpot(result.data);
      } catch (error) {
        console.error("Error in fetchSpotDetails", error);
        setSpot(null);
      } finally {
        setLoading(false);
      }
    };
    fetchSpotDetails();
  }, [id, user]);

  const handleAddRating = async (rating) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      const response = await privateApiClient.post(
        `kebab_spots/rating/${id}/rate/`,
        { value: rating },
      );
      setRatingNumber(response.data);
    } catch (error) {
      console.error("Error in adding rating function", error);
    }
  };

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
  const currentRating = ratingNumber
    ? ratingNumber.user_rating
    : spot.properties.user_rating;

  return (
    <div>
      {/* Only show "Update Spot" button if current user is the spot owner */}
      {isOwner && (
        <Link to={`/update_spot/${id}/`}>
          <button>Update Spot</button>
        </Link>
      )}
      <h2>Name: {spot.properties.name}</h2>
      <p>Description: {spot.properties.description}</p>
      <p>
        Private territory: {spot.properties.private_territory ? "Yes" : "No"}
      </p>
      <p>Shops nearby: {spot.properties.shop_nearby ? "Yes" : "No"}</p>
      <p>Gazebos: {spot.properties.gazebos ? "Yes" : "No"}</p>
      <p>Near water: {spot.properties.near_water ? "Yes" : "No"}</p>
      <p>Can fishing: {spot.properties.fishing ? "Yes" : "No"}</p>
      <p>Trash cans: {spot.properties.trash_cans ? "Yes" : "No"}</p>
      <p>Tables: {spot.properties.tables ? "Yes" : "No"}</p>
      <p>Benches: {spot.properties.benches ? "Yes" : "No"}</p>
      <p>Fire pits: {spot.properties.fire_pit ? "Yes" : "No"}</p>
      <p>Toilet: {spot.properties.toilet ? "Yes" : "No"}</p>
      <p>Car access: {spot.properties.car_access ? "Yes" : "No"}</p>
      <div className="rating">
        <input
          type="radio"
          checked={currentRating === 5}
          id="star5"
          name="rating"
          value="5"
          onChange={(e) => handleAddRating(e.target.value)}
        />
        <label htmlFor="star5"></label>
        <input
          type="radio"
          checked={currentRating === 4}
          id="star4"
          name="rating"
          value="4"
          onChange={(e) => handleAddRating(e.target.value)}
        />
        <label htmlFor="star4"></label>
        <input
          type="radio"
          checked={currentRating === 3}
          id="star3"
          name="rating"
          value="3"
          onChange={(e) => handleAddRating(e.target.value)}
        />
        <label htmlFor="star3"></label>
        <input
          type="radio"
          checked={currentRating === 2}
          id="star2"
          name="rating"
          value="2"
          onChange={(e) => handleAddRating(e.target.value)}
        />
        <label htmlFor="star2"></label>
        <input
          type="radio"
          checked={currentRating === 1}
          id="star1"
          name="rating"
          value="1"
          onChange={(e) => handleAddRating(e.target.value)}
        />
        <label htmlFor="star1"></label>
      </div>
      {ratingNumber && <p>You rated: {ratingNumber.user_rating}</p>}
      {ratingNumber ? (
        <p>Average rating: {ratingNumber.average_rating}</p>
      ) : (
        <p>Average rating: {spot.properties.average_rating}</p>
      )}
      {ratingNumber ? (
        <p>Votes: {ratingNumber.ratings_count}</p>
      ) : (
        <p>Votes: {spot.properties.ratings_count}</p>
      )}
      <BaseMap center={spotCoords} zoom={13}>
        <Marker position={spotCoords}>
          <Popup>{spot.properties.name}</Popup>
        </Marker>
      </BaseMap>
    </div>
  );
};

export default DetailsSpot;
