import React, { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import useLocalState from "../useLocalState";
import axios from "axios";
import { BASE_URL } from "../../Service/Service";

const PrivateRoute = ({ children }) => {
  const VALIDATE_URL = BASE_URL + "auth/token";
  const [jwt, setJwt] = useLocalState("", "jwt");
  const [isLoading, setIsLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const navigate = useNavigate();
  let config = {
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    params: {
      token: jwt,
    },
  };
  const checkValid = async () =>{
      await 
      axios.get(VALIDATE_URL, config).then((res) => {
      setIsValid(res.data);
      setIsLoading(false);
    })
  }
  useEffect(()=>{
    if (jwt) {
      checkValid();
    } else {
      navigate("/login")
    }
  },[]);

  return isLoading ? (
    <div className="loading"></div>
  ) : isValid ? (
    children
  ) : (
    <Navigate to="/login"/>
  );
};

export default PrivateRoute;
