import { Marker, Popup } from "react-leaflet";
import BaseMap from "../map/BaseMap";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { privateApiClient, publicApiClient } from "../../api";
import { AuthContext } from "../../contexts/AuthContext";
import "../../styles/rating.css";
import "../../styles/complaint.css";

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
  const [complaintWindow, setComplaintWindow] = useState(false);
  const [complaintReason, setComplaintReason] = useState("");
  const [loading, setLoading] = useState(false);

  /**
   * Fetches spot details from the API when component mounts or when spot ID changes.
   *
   * Handles:
   * - Loading state management
   * - Error handling (sets spot to null on error)
   * - Uses public API endpoint (no authentication required)
   */
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

  const handleComplaint = async (e) => {
    e.preventDefault();
    try {
      await privateApiClient.post(`/kebab_spots/complaint/${id}/`, {
        reason: complaintReason,
      });
      window.alert("Your complaint has been submitted");
      setComplaintReason("");
      setComplaintWindow(false);
    } catch (error) {
      if (error.response?.data) {
        window.alert(error.response.data[0]);
        setComplaintWindow(false);
        setComplaintReason("");
      } else {
        console.error("Error in handleComplaint", error);
      }
    }
  };

  useEffect(() => {
    fetchSpotDetails();
  }, [id, user]);

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
    <div className="map-layout">
      <div className="map-controls">
        {/* Only show "Update Spot" button if current user is the spot owner */}
        {isOwner && (
          <Link to={`/update_spot/${id}/`}>
            <button>Update Spot</button>
          </Link>
        )}

        <h2>{spot.properties.name}</h2>
        <p>{spot.properties.description}</p>
        <div className="rating-box">
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

          {/* Initially we show rating from loaded spot data.  */}
          {/* After user votes, ratingNumber contains updated rating and votes count. */}
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
        </div>
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
        <button onClick={() => setComplaintWindow(true)}>Complaint</button>
      </div>

      <div className="map-column">
        <BaseMap center={spotCoords} zoom={13}>
          <Marker position={spotCoords}>
            <Popup>{spot.properties.name}</Popup>
          </Marker>
        </BaseMap>
        {spot.properties.photos?.length > 0 && (
          <div className="spot-photos">
            <h3>Photos</h3>
            <div className="photos-grid">
              {spot.properties.photos.map((photo) => (
                <a
                  href={photo.photo}
                  key={photo.id}
                  target="_blank"
                  rel="noopener noreferer"
                >
                  <img
                    src={photo.photo}
                    alt={`Photoof  ${spot.properties.name}`}
                  />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
      {complaintWindow && (
        <div
          className="modal-overlay"
          onClick={() => setComplaintWindow(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Report spot</h3>
            <form onSubmit={handleComplaint}>
              <textarea
                value={complaintReason}
                onChange={(e) => setComplaintReason(e.target.value)}
                placeholder="Reason of complaint"
              />
              <button type="submit">Send</button>
              <button type="button" onClick={() => setComplaintWindow(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailsSpot;
