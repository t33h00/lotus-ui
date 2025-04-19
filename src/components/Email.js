import React, { useState, useRef, useEffect } from "react";
import './Reset.css';
import { Helmet } from "react-helmet-async";
import { BASE_URL } from "../Service/Service";
import axios from "axios";
import './Email.css';
import { useNavigate } from 'react-router-dom';

function Reset() {
    const RESET_URL = BASE_URL + "auth/reset";
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    let config = {
        params:{
            email:email
        },
        withCredentials: true
      };

    const data = async () => {
        setLoading(true);
        try {
            await axios.get(RESET_URL, config).then((res) => {
                navigate("/reset");
                setLoading(false);
            });
            
        } catch (error) {
               if(error.response.status === 404){
                alert("Email not found");
                navigate("/email");
                setLoading(false)}
        }
    };

    const handleSubmit = () => {
        data();
    }

    return (
        <>
            <Helmet>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
                />
            </Helmet>
            {!loading ? (
                <div className="wrapper-email">
                    <label className="title-email">Please enter your email</label>
                    <input onChange={(e)=>setEmail(e.target.value)} className="input-email" type="email" placeholder="Email" required />
                    <button className="submit-email" onClick={handleSubmit}>→</button>
                </div>
            ) : (
                <div className="loading"></div>
            )}
        </>
    );
}

export default Reset;
