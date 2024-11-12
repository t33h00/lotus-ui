import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import axios from "axios";
import './SignUp.css';
import { BASE_URL } from "../Service/Service";

function SignUp() {
  const [userFound, setUserFound] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const SIGNUP_URL = BASE_URL + "api/save";
  const [loading, setLoading] = useState(true);
  const onSubmit = (data) => {
    try {
      axios.post(SIGNUP_URL, data).then((res) => {
        if (res.status === 201) {
          setLoading(false);
        }
      });
    } catch (error) {
      console.log(error.AxiosError)
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
      {loading ? (
        <div className="wrapper">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="title">Registration</div>
            <div className="form" >
              <div className="inputfields">
                <label>Email</label>
                <input
                  type="text"
                  className="input"
                  {...register("email", {
                    required: true,
                    pattern: /^[^@ ]+@[^@ ]+\.[^@ .]{2,}$/,
                  })}
                />
                {errors.email?.type === "required" && "Email is required!" && (
                  <p className="errorMsg">
                    Email is required.
                  </p>
                )}
                {errors.email?.type === "pattern" && (
                  <p className="errorMsg" >Email is not valid.</p>
                )}
              </div>
              <div className="inputfields">
                <label>First Name</label>
                <input
                  type="text"
                  className="input"
                  {...register("firstName", { required: true })}
                />
                {errors.firstName?.type === "required" &&
                  "Email is required!" && (
                    <p className="errorMsg">
                      First name is required.
                    </p>
                  )}
              </div>
              <div className="inputfields">
                <label>Last Name</label>
                <input
                  type="text"
                  className="input"
                  {...register("lastName", { required: true })}
                />
                {errors.lastName?.type === "required" &&
                  "Last name is required!" && (
                    <p
                      className="errorMsg"
                    >
                      Last name is required.
                    </p>
                  )}
              </div>
              <div className="inputfields">
                <label>Password</label>
                <input
                  type="password"
                  className="input"
                  {...register(
                    "password",
                    { required: true,
                    pattern: /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{6,}$/ } //(?=.*[@#$%^&+=])
                  )}
                />
                {errors.password?.type === "required" &&
                  "password is required!" && (
                    <p className="errorMsg">
                      Password is required
                    </p>
                  )}
                  {errors.password?.type === "pattern" && (
                  <p className="errorMsg" >password must be min 6 and containing at least 1 uppercase, 1 lowercase, and 1 digit.</p>
                )}
              </div>
              <div className="inputfield">
                <button className="btn" type="submit">Submit</button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="wrapper">
          <p>Please check your email to verify your account</p>
          <a href="/login">Login</a>
        </div>
      )}
    </>
  );
}
export default SignUp;
