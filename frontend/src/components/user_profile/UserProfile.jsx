import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const { user, updateUserProfile } = useContext(AuthContext);
  const [editMode, setEditMode] = useState(false);
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    city: "",
    country: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        city: user.city || "",
        country: user.country || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateUserProfile({
      first_name: form.firstName,
      last_name: form.lastName,
      email: form.email,
      city: form.city,
      country: form.country,
    });
    setEditMode(false);
  };

  const toggleCancelButton = (
    <button onClick={() => setEditMode((prev) => !prev)}>
      {editMode ? "Cancel" : "Edit"}
    </button>
  );

  useEffect(() => {
    if (!user) {
      return navigate("/");
    }
  }, [user]);

  if (!user) return <p>Loading</p>;

  return (
    <div>
        <button onClick={() => navigate("/user_history")}>Your spots</button>
      <div className="user-page-container">
        {editMode ? (
          <div>
            <form className="user-page-form" onSubmit={handleSubmit}>
              <input
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="First name"
              />
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Last name"
              />
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="E-mail"
              />
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
              />
              <input
                name="country"
                value={form.country}
                onChange={handleChange}
                placeholder="Country"
              />
              <button type="submit">Save</button>
              {toggleCancelButton}
            </form>
          </div>
        ) : (
          <div>
            <h1>Your info, {user.username}:</h1>
            <p>First name: {user.first_name}</p>
            <p>last name: {user.last_name}</p>
            <p>E-mail: {user.email}</p>
            <p>City: {user.city}</p>
            <p>Country: {user.country}</p>
            {toggleCancelButton}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
