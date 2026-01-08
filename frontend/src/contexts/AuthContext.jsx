import { createContext, useEffect, useState } from "react";
import { publicApiClient, privateApiClient } from "../api"; // isntead of writing paths in every request, using thim in variables with interceptors
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate(); // for redirection by using URL path
  const [user, setUser] = useState(null); // user data will be written in this state
  const [errorMessage, setErrorMessage] = useState(null); // state for throwing erors in components

  // errors tells exactly in which function we got error

  // registration redirects to login page after success
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

  // login functionality starts getting user function, after saving tokens
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

  // logout functionality clears tokens from local storage, deletes user state and redirect to main page
  const logout = async () => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  // Main functionality of downloading user profile
  const fetchUserProfile = async () => {
    try {
      const response = await privateApiClient.get("auth/user_profile/");
      setUser(response.data);
    } catch (error) {
      setUser(null);
      error.response?.data
        ? console.error("error in fetchUserProfile", error.response.data)
        : console.error("error in fetchUserProfile", error);
    }
  };

  // updating user data in backend and writing updated data from backends response in user state
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

  // on first loading of app we download user profile
  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      fetchUserProfile();
    } else {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        registration,
        login,
        logout,
        fetchUserProfile,
        updateUserProfile,
        user,
        errorMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
