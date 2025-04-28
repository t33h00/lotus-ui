import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL, logout } from "../../Service/Service";
import useLocalState from "../useLocalState";
import { set } from "date-fns";

const PrivateRoute = (Component, authenticated) => {
  const WrappedComponent = (props) => {
    const VALIDATE_URL = BASE_URL + "auth/token";
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useLocalState("", "user");
    const [isValid, setIsValid] = useState(false);
    const navigate = useNavigate();

    const checkValid = async () => {
      try {
        const response = await axios.get(VALIDATE_URL, {
          withCredentials: true,
        });
        if(response.data.valid === true) {
          setIsValid(true);
          setUser(response.data.user);
          console.log("User data:", response.data.user);
        } else if (response.data.status === 401) {
          alert("Session Expired! Please login again.");
          setUser("");
          logout(navigate);
        }
      } catch (error) {
        setIsValid(false);
        logout(navigate);
      } finally {
        setIsLoading(false); // Ensure loading is set to false after the request
      }
    };

    useEffect(() => {
      checkValid();
    }, []);

    return isLoading ? (
      <div className="loading"></div>
    ) : isValid === authenticated ? (
      <Component {...props} /> // Forward props to the wrapped component
    ) : null;
  };

  return WrappedComponent;
};

export default PrivateRoute;
