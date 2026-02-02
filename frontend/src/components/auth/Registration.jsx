import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";

const Registration = () => {
  const { registration, errorMessage } = useContext(AuthContext);
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    registration({
      username: form.username,
      password: form.password,
      password_2: form.confirmPassword,
    });
  };

  return (
    <>
      <form className="user-page-container user-page-form" onSubmit={handleSubmit}>
        {errorMessage?.non_field_errors && (
          <p>{errorMessage.non_field_errors[0]}</p>
        )}
        {errorMessage?.password && <p>{errorMessage.password[0]}</p>}
        {errorMessage?.username && <p>{errorMessage.username[0]}</p>}
        <input
          name="username"
          type="text"
          value={form.username}
          onChange={handleChange}
          placeholder="Username"
        />
        <input
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Password"
        />
        <input
          name="confirmPassword"
          type="password"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm password"
        />
        <button type="submit">Sign up</button>
      </form>
    </>
  );
};

export default Registration;
