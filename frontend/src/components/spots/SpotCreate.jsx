import { useState } from "react";
import { Marker, useMapEvents } from "react-leaflet";
import BaseMap from "../map/BaseMap";
import { privateApiClient } from "../../api";
import { useNavigate } from "react-router-dom";

const SpotCreate = () => {
  const navigate = useNavigate();
  const [position, setPosition] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const LocationMarker = ({ setPos }) => {
    useMapEvents({
      click(e) {
        setPos(e.latlng);
      },
    });
    return null;
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!position) {
      alert("Please put a dot on the map!");
      return;
    }

    const kebabSpotData = {
      name: form.name,
      description: form.description,
      coordinates: {
        type: "Point",
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
          onChange={handleChange}
          placeholder="Name of point"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description of point"
        />

        <button type="submit">Save</button>
      </form>

      <p>Click on the map to set the location</p>
      
      <BaseMap>
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

export default SpotCreate;
