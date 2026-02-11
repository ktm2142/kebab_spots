import { createContext, useEffect, useState } from "react";
import { publicApiClient, privateApiClient } from "../api"; // isntead of writing paths in every request, using thim in variables with interceptors
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate(); // for redirection by using URL path
  const [user, setUser] = useState(null); // user data will be written in this state
  const [errorMessage, setErrorMessage] = useState(null); // state for throwing erors in components
  const [loadingAuth, setLoadingAuth] = useState(true);

  // registration redirects to login page after success
  const registration = async (data) => {
    try {
      setErrorMessage(null);
      await publicApiClient.post("auth/registration/", data);
      navigate("/login");
    } catch (error) {
      if (error.response?.data) {
        setErrorMessage(error.response.data);
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
      setLoadingAuth(true);
      const response = await privateApiClient.get("auth/user_profile/");
      setUser(response.data);
      setErrorMessage(null);
    } catch (error) {
      if (error.response?.status === 401) {
        setErrorMessage("Your session is expired. please log in again");
      }
    } finally {
      setLoadingAuth(false);
    }
  };

  // updating user data in backend and writing updated data from backends response in user state
  const updateUserProfile = async (data) => {
    try {
      setErrorMessage(null);
      const response = await privateApiClient.patch("auth/user_profile/", data);
      setUser(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        setErrorMessage("Yout session is expired. Please log in again");
      }
    }
  };

  // on first loading of app we download user profile
  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      fetchUserProfile();
    } else {
      setUser(null);
      setLoadingAuth(false);
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
        loadingAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
