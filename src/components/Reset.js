import React, { useState, useRef, useEffect } from "react";
import './Reset.css';
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { BASE_URL } from "../Service/Service";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

function Reset() {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();
    const RESET_URL = BASE_URL + "auth/update";
    const [loading, setLoading] = useState(false);
    const [completed, setCompleted] = useState(false);
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [verificationCode, setVerificationCode] = useState(Array(6).fill(""));
    const inputRefs = useRef([]);
    const [passwordMatch, setPasswordMatch] = useState(true);

    useEffect(() => {
        const subscription = watch((value, { name }) => {
            if (name === "password" || name === "confirmPassword") {
                setPasswordMatch(value.password === value.confirmPassword);
            }
        });
        return () => subscription.unsubscribe();
    }, [watch]);

    const isFormValid = () => {
        return (
            verificationCode.every((digit) => digit !== "") &&
            passwordMatch &&
            watch("password") &&
            watch("confirmPassword")
        );
    };

    const requestBody = {
        password: password,
        code: verificationCode.join(""),
    };

    const resetPassword = async () => {
        setLoading(true);
        try {
            const res = await axios.put(RESET_URL, requestBody);
            if (res.status === 202) {
                setCompleted(true);
            }
        } catch (error) {
            if(error.response.status === 400){
                alert("Invalid verification code");
                setLoading(false)
                navigate("/reset");
            } if(error.response.status === 404){
                alert("The verification code has expired. Please request a new one.");
                setLoading(false)
                navigate("/email");}
        }
    };

    const handleChange = (e, index) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 1) {
            const newCode = [...verificationCode];
            newCode[index] = value;
            setVerificationCode(newCode);
            if (value && index < 5) {
                inputRefs.current[index + 1].focus();
            }
        }
    };

    const onSubmit = () => {
        resetPassword();
    };

    return (
        <>
            <Helmet>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
                />
            </Helmet>
            {!loading ? (<div className="wrapper">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="title">Enter Verification Code</div>
                    <div className="form">
                        <div className="reset-wrapper">
                            <div className="resetfields">
                                {verificationCode.map((digit, index) => (
                                    <input className="resetinput"
                                        key={index}
                                        type="text"
                                        value={digit}
                                        onChange={(e) => handleChange(e, index)}
                                        maxLength="1"
                                        ref={(el) => (inputRefs.current[index] = el)}
                                    />
                                ))}
                            </div>
                        </div>
                        <div className="inputfields">
                            <label>Password</label>
                            <input
                                type="password"
                                className="input"
                                onKeyUp={(e) => setPassword(e.target.value)}
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
                        <div className="inputfield submit-container">
                            <button className="btn" type="submit" disabled={!isFormValid()}>Submit</button>
                        </div>
                    </div>
                </form>
            </div>) : completed ? (
        <div className="wrapper">
          <p>Password changed successfully. Please login again!</p>
          <a href="/login">Login</a>
        </div>
      ) : (
        <div className="loading"></div>
      )}
        </> )}
        export default Reset;