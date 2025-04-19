import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL, logout } from "../../Service/Service";

const PrivateRoute = ({ children }) => {
  const VALIDATE_URL = BASE_URL + "auth/token";
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const navigate = useNavigate();

  const checkValid = async () => {
    try {
      // Send the request with credentials to validate the session
      const response = await axios.get(VALIDATE_URL, {
        withCredentials: true, // Ensure cookies are sent with the request
      });
      setIsValid(response.data); // Assume the backend returns true/false for validity
      setIsLoading(false);
    } catch (error) {
      setIsValid(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkValid();
  }, []);

  useEffect(() => {
    if ( !isLoading && !isValid) {
      // If not loading and token is invalid, log out the user
      logout(navigate);
    }
  }, [isLoading, isValid, navigate]);

  return isLoading ? (
    <div className="loading"></div>
  ) : isValid ? (
    children
  ) : (
    null
  );
};

export default PrivateRoute;
