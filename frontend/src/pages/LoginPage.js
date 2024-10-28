import React from "react";
import "./LoginPage.css";
import LoginForm from "../components/auth/LoginForm";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

import BilkentLogo from "./BilkentÜniversitesi-logo.png";

const LoginPage = () => {
  const { login, error} = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (email, password) => {
    const response = await login(email, password);
    if (response) {
      navigate("/dashboard", {
        state: { user_type: response.user_type, email: email },
      });
    } else {
      console.log("Login failed");
    }
  };

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  return (
    <div className="container">
      {/* Left side: login form */}
      <div className="left-side">
        <img
          src={BilkentLogo}
          alt="Bilkent University Logo"
          className="bilkent-logo"
        />
        <h2>Welcome to BTO Core 🌟</h2>
        <LoginForm onSubmit={handleLogin} />
        {error && <p className="error-message">{error}</p>}
        <button className="forgot-password" onClick={handleForgotPassword}>
          Forgot Password?
        </button>
      </div>

      {/* Right side: abstract image */}
      <div className="right-side"></div>
    </div>
  );
};

export default LoginPage;
