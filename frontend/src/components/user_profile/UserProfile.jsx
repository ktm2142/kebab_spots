import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const UserProfile = () => {
  const { user, updateUserProfile } =
    useContext(AuthContext);
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
    <>
      {editMode ? (
        <div>
          <form onSubmit={handleSubmit}>
            <input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="Your first name"
            />
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Your last name"
            />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Your email"
            />
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Your city"
            />
            <input
              name="country"
              value={form.country}
              onChange={handleChange}
              placeholder="Your country"
            />
            <button type="submit">Save</button>
            {toggleCancelButton}
          </form>
        </div>
      ) : (
        <div>
          <h1>Hello {user.username}</h1>
          <p>First name: {user.first_name}</p>
          <p>last name: {user.first_name}</p>
          <p>E-mail: {user.email}</p>
          <p>City: {user.city}</p>
          <p>Country: {user.country}</p>
          {toggleCancelButton}
        </div>
      )}
    </>
  );
};

export default UserProfile;
