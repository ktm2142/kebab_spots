import { createContext, useEffect, useState } from "react";
import { publicApiClient, privateApiClient } from "../api";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  // const [authenticated, setAuthenticated] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const registration = async (data) => {
    try {
      setErrorMessage(null);
      await publicApiClient.post("auth/registration/", data);
      navigate("/login");
    } catch (error) {
      if (error.response?.data) {
        setErrorMessage(error.response.data);
      } else {
        console.error("Error in registration function", error);
      }
    }
  };

  const login = async (data) => {
    try {
      const response = await publicApiClient.post("auth/token/obtain/", data);
      localStorage.setItem("accessToken", response.data.access);
      localStorage.setItem("refreshToken", response.data.refresh);
      await fetchUserProfile();
      navigate("/");
    } catch (error) {
      if (error.response?.data) {
        setErrorMessage(error.response.data);
      } else {
        console.error("Error in login function", error);
      }
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      // setAuthenticated(false)
      setUser(null)
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      // setAuthenticated(false);
      const response = await privateApiClient.get("auth/user_profile/");
      setUser(response.data);
      // setAuthenticated(true);
    } catch (error) {
      setUser(null)
      // setAuthenticated(false)
      error.response?.data
        ? console.error("error in fetchUserProfile", error.response.data)
        : console.error("error in fetchUserProfile", error);
    }
  };

  const updateUserProfile = async (data) => {
    try {
      const response = await privateApiClient.patch("auth/user_profile/", data);
      setUser(response.data);
    } catch (error) {
      error.response?.data
        ? console.error("error in updateUserProfile", error.response.data)
        : console.error("error in updateUserProfile", error.response);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      fetchUserProfile()
    } else {
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        registration,
        login,
        logout,
        fetchUserProfile,
        updateUserProfile,
        user,
        // authenticated,
        errorMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
