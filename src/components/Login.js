import React, { useState } from "react";
import axios from "axios";
import useLocalState from "./useLocalState";
import { Helmet } from "react-helmet-async";
import { BASE_URL } from "../Service/Service";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import logo from "../image/text.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [invalid, setInvalid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useLocalState("", "user");

  const LOGIN_URL = BASE_URL + "auth/login";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setInvalid(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setInvalid("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        LOGIN_URL,
        { email, password },
        { withCredentials: true }
      );
      if (response.status === 200 && response.data) {
        setUser(response.data); // Persist user data dynamically

        // Delay navigation until user state is updated
        setTimeout(() => {
          if (user) {
            navigate("/transaction");
          } else {
            setInvalid("Unexpected error. Please try again.");
          }
        }, 100); // Small delay to ensure state update
      } else if (response.status === 401) {
        setInvalid("Invalid email or password. Please try again.");
      } else {
        setInvalid("Unexpected error. Please try again.");
      }
    } catch (error) {
      if (error.code === "ERR_NETWORK") {
        setInvalid("System down. Please contact support.");
      } else if(error.code === "ERR_BAD_REQUEST") {
        setInvalid("Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Helmet>

      <section className="login">
        {/* <img  src={logo} alt="Logo" className="login-logo" /> */}
        <div className="login-card">
          <h1 className="login-heading">Sign in to your account</h1>
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="invalid">
              {invalid && <p>{invalid}</p>}
            </div>
            <div>
              <label htmlFor="email">Your email</label>
              <input
                type="email"
                name="email"
                id="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
              />
            </div>
            <div>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                name="password"
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <button type="submit" className="login-button" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
              </button>
              <a style={{textDecoration:"none"}} href="/email" className="login-button">
                Forgot
              </a>
            </div>
            <p className="login-link">
              Don’t have an account yet?{" "}
              <a href="/signup">Sign up</a>
            </p>
          </form>
        </div>
      </section>
    </>
  );
}

export default Login;