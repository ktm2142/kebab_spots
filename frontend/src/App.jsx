import { useContext } from "react";
import { Route, useNavigate, useLocation, Routes } from "react-router-dom";
import "../src/styles/App.css";
import Registration from "./components/auth/Registration";
import Login from "./components/auth/Login";
import { AuthContext } from "./contexts/AuthContext";
import UserProfile from "./components/user_profile/UserProfile";
import Map from "./components/map/Map";
import CreateSpot from "./components/spots/CreateSpot";
import DetailsSpot from "./components/spots/DetailsSpot";
import UpdateSpot from "./components/spots/UpdateSpot";

function App() {
  const { logout, user } = useContext(AuthContext);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const mainPage = pathname === "/";
  const registrationPage = pathname === "/registration";
  const loginPage = pathname === "/login";
  const userProfilePage = pathname === "/user_profile";

  return (
    <>
      <header className="app-header">
        <div className="nav-left">
          {!mainPage && (
            <button className="primary" onClick={() => navigate("/")}>
              To main page
            </button>
          )}
        </div>
        <h1 className="header-title">Kebab Spots</h1>
        <div className="nav-right">
          {!user ? (
            <>
              <button
                onClick={() =>
                  registrationPage ? navigate("/") : navigate("/registration")
                }
              >
                {registrationPage ? "Close" : "Registration"}
              </button>
              <button
                onClick={() => (loginPage ? navigate("/") : navigate("/login"))}
              >
                {loginPage ? "Close" : "Login"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() =>
                  userProfilePage ? navigate("/") : navigate("/user_profile")
                }
              >
                {userProfilePage ? "Close" : "Profile"}
              </button>
              <button onClick={logout}>Logout</button>
            </>
          )}
        </div>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Map />} />
          <Route path="/registration" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/user_profile" element={<UserProfile />} />
          <Route path="/create_spot" element={<CreateSpot />} />
          <Route path="/details_spot/:id/" element={<DetailsSpot />} />
          <Route path="/update_spot/:id/" element={<UpdateSpot />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
