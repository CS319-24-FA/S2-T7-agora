import React, { useState } from "react";
import "./LoginPage.css";
import LoginForm from "../components/auth/LoginForm";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import BilkentLogo from "../assets/BilkentÜniversitesi-logo.png";
import LibraryPhoto from "../assets/bilkent-university.jpg";
import HomeIcon from "@mui/icons-material/Home";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const [useOtp, setUseOTP] = useState(true);

  const handleLogin = async (email, password) => {
    try {
      localStorage.clear();
      const response = await login(email, password);
      if (response) {
        localStorage.setItem("tempToken", response.token);
        localStorage.setItem("userType", response.user_type);
        localStorage.setItem("userId", response.user_id);
        localStorage.setItem("email", email);
        localStorage.setItem("password", password);

        navigate("/verify-otp");
      } else {
        setError("Login failed");
      }
    } catch (err) {
      setError(err.message || "An error occurred during login.");
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  const handleGoHome = () => {
    navigate("/"); // go home
  };

  return (
    <div className="container">
      <div className="left-side">
        <button className="go-home-button" onClick={handleGoHome}>
          <HomeIcon />
        </button>
        <img
          src={BilkentLogo}
          alt="Bilkent University Logo"
          className="bilkent-logo"
        />
        <h2>Welcome to BTO Core 🌟</h2>
        <LoginForm
          onSubmit={handleLogin}
          isLoading={isLoading}
          onForgotPassword={handleForgotPassword}
        />
        {error && <p className="error-message">{error}</p>}
      </div>
      <div className="right-side">
        <img
          src={LibraryPhoto}
          alt="Bilkent Library"
          className="library-photo"
        />
      </div>
    </div>
  );
};

export default LoginPage;
