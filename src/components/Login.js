import React from "react";
import {useState} from 'react';
import axios from "axios";
import useLocalState from "./useLocalState";
import { Helmet } from "react-helmet-async";
import { BASE_URL } from "../Service/Service";
import './Login.css';
import { Troubleshoot } from "@mui/icons-material";

function Login() {
   const [user,setUser] = useLocalState("","user")
   const[email,setEmail] = useState('');
   const[password,setPassword] = useState('');
   const[jwt,setJwt] = useLocalState("","jwt");
   const role = user.authorities;
   const [loading, setLoading] = useState(true)
   const [invalid,setInvalid] = useState(false)
   const mili = new Date().getTime() - 21600000;
  const today = new Date(mili).toJSON().slice(0, 10);
   const LOGIN_URL = BASE_URL + "auth/login";

   const requestBody = {
    email:email,
    password:password
   }

   const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Expose-Headers':'Authorization'
  }

   const login = async ()=>{
    try{ await axios.post(LOGIN_URL, requestBody, {
      headers: headers
    }).then((res)=> {
        const auth = res.headers['authorization'];
        setJwt(auth);
        setUser(res.data)
        setLoading(false)
    })
    } catch (error){
      setInvalid(true)
      console.log(error)
    }
   }
   if(!loading){
    window.location.href = "/transaction/" + `${today}`;
  }
  return (
    <>
    <Helmet>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
      </Helmet>
      {!invalid?"":(<p style={{color:"red"}}>Invalid credentials</p>)}
    <section className="">
      <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-white">
          Lotus Booking    
        </a>
        <div className="bg-white w-full rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:border-gray-700">
          <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                  Sign in to your account
              </h1>
              <form className="space-y-4 md:space-y-6" action="#">
                  <div>
                      <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 ">Your email</label>
                      <input type="email" name="email" id="email" onChange={(e)=>setEmail(e.target.value)}
                             className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 " 
                             placeholder="name@company.com" required=""></input>
                  </div>
                  <div>
                      <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900">Password</label>
                      <input type="password" name="password" id="password" onChange={(e)=>setPassword(e.target.value)}
                             className="bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5" 
                             required=""></input>
                  </div>
                  <button type="button"
                          id="submit"
                          onClick={login}
                          className="w-full text-black bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 ">
                          Sign in</button>
                  <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                      Don’t have an account yet? <a href="/signup" className="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign up</a>
                  </p>
              </form>
          </div>
        </div>
      </div>
    </section>
    </>
  )
}

export default Login;
