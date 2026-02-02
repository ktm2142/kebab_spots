import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";

const Login = () => {
  const { login, errorMessage } = useContext(AuthContext);
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login({
      username: form.username,
      password: form.password,
    });
  };

  return (
    <>
      <form className="user-page-container user-page-form" onSubmit={handleSubmit}>
      {errorMessage?.detail && (
          <p>{errorMessage.detail}</p>
        )}
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
        <button type="submit">Sign in</button>
      </form>
    </>
  );
};

export default Login
