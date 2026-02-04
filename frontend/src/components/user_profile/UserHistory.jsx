import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { privateApiClient } from "../../api";

const UserHistory = () => {
  const { user, loadingAuth } = useContext(AuthContext);
  const navigate = useNavigate();
  const [spotsList, setSpotsList] = useState([]);

  const fetchSpotsHistory = async () => {
    try {
      const response = await privateApiClient.get("auth/user_history/");
      setSpotsList(response.data);
    } catch (error) {
      console.error("Error in fetchSpotsHistory", error);
    }
  };

  useEffect(() => {
    fetchSpotsHistory();
  }, [user]);

  useEffect(() => {
    if (loadingAuth) {
      return;
    }

    if (!user) {
      return navigate("/");
    }
  }, [user, loadingAuth]);

  if (loadingAuth) return <p>Loading</p>;
  if (!user) return <p>Loading</p>;

  if (spotsList.length == 0) {
    return (
      <div className="user-page-container user-history">
        <p>You don't have spots yet.</p>
        <p>Create one and tell people about</p>
        <p>a great place to have a barbecue.</p>
      </div>
    );
  }

  return (
    <div className="user-history">
      <h2>Your spots</h2>
      {spotsList.map((spot) => (
        <div key={spot.id} className="user-page-container user-history">
          <Link to={`/details_spot/${spot.id}`}>
            <p>{spot.name}</p>
            <p>Average rating: {spot.average_rating}</p>
            <p>Count of votes: {spot.ratings_count}</p>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default UserHistory;
