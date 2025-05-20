import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import axios from "axios";
import './SignUp.css';
import "./Login.css";
import {useNavigate} from 'react-router-dom';
import { BASE_URL } from "../Service/Service";

function SignUp() {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const SIGNUP_URL = BASE_URL + "api/save";
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const navigate = useNavigate();
  const [passwordMatch, setPasswordMatch] = useState(true);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await axios.post(SIGNUP_URL, data);
      if (response.status === 201 || response.status === 200) {
        setCompleted(true);
      }
    } catch (error) {
      if(error.response.status === 302){
        alert("Email already exists");
        navigate("/login");
      }
    }
  };

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "password" || name === "confirmPassword") {
        setPasswordMatch(value.password === value.confirmPassword);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  return (
    <>
      <Helmet>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Helmet>
      {!loading ? (
        <div className="wrapper" style={{ maxWidth:"450px", borderRadius:"5px" }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="title">Registration</div>
            <div className="form">
              <div className="inputfields">
                <label>Email</label>
                <input
                  type="text"
                  className="input"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                      message: "Email is not valid",
                    },
                  })}
                />
                {errors.email && <p className="errorMsg">{errors.email.message}</p>}
              </div>
              <div className="inputfields">
                <label>First Name</label>
                <input
                  type="text"
                  className="input"
                  {...register("firstName", { required: "First name is required" })}
                />
                {errors.firstName && <p className="errorMsg">{errors.firstName.message}</p>}
              </div>
              <div className="inputfields">
                <label>Last Name</label>
                <input
                  type="text"
                  className="input"
                  {...register("lastName", { required: "Last name is required" })}
                />
                {errors.lastName && <p className="errorMsg">{errors.lastName.message}</p>}
              </div>
              <div className="inputfields">
                <label>Password</label>
                <input
                  type="password"
                  className="input"
                  {...register("password", {
                    required: "Password is required",
                    // pattern: {
                    //   value: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).{6,}$/,
                    //   message: "Password must be min 6 and contain at least 1 uppercase, 1 lowercase, and 1 digit",
                    // },
                  })}
                />
                {errors.password && <p className="errorMsg">{errors.password.message}</p>}
              </div>
              <div className="inputfields">
                <label>Confirm Password</label>
                <input
                  type="password"
                  className="input"
                  {...register("confirmPassword", {
                    required: "Confirm password is required",
                    validate: (value) =>
                      value === watch("password") || "Passwords do not match",
                  })}
                />
                {errors.confirmPassword && <p className="errorMsg">{errors.confirmPassword.message}</p>}
                {!passwordMatch && <p className="errorMsg">Passwords do not match</p>}
              </div>
              <div className="inputfield">
                <button className="login-button" style={{width:"100%"}} type="submit" disabled={loading}>Submit</button>
              </div>
            </div>
          </form>
        </div>
      ) : completed ? (
        <div className="wrapper">
          <p>Please check your email to verify your account</p>
          <a href="/login">Login</a>
        </div>
      ) : (
        <div className="loading"></div>
      )}
    </>
  );
}

export default SignUp;
