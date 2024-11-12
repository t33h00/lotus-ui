import React, { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import useLocalState from "../useLocalState";
import axios from "axios";
import { BASE_URL } from "../../Service/Service";

const PrivateRoute = ({ children }) => {
  const VALIDATE_URL = BASE_URL + "auth/token";
  const [jwt, setJwt] = useLocalState("", "jwt");
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState();
  let config = {
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    params: {
      token: jwt,
    },
  };
  if (jwt) {
      const checkValid = async () =>{
        await 
        axios.get(VALIDATE_URL, config).then((res) => {
        setIsValid(res.data);
        setIsLoading(false);
      })
    }
    checkValid();
  } else {
    <Navigate to="/login"/>
  }
  return isLoading ? (
    <div>...loading</div>
  ) : isValid ? (
    children
  ) : (
    <Navigate to="/login"/>
  );
};

export default PrivateRoute;
