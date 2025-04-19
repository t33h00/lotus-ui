import React, { useContext } from "react";
import useLocalState from "./useLocalState";
import "./Transaction.css";

function User() {
  const [user, setUser] = useLocalState("", "user");
  const fullName = user.firstName + " " + user.lastName;

  return (
    <div className="wrapper">
      <div className="title">User Profile</div>
      <div className="form">
        <div className="inputfield">
          <label> Full Name</label>
          <input type="text" value={fullName} className="input" disabled />
        </div>
        <div className="inputfield">
          <label>Email Address</label>
          <input type="text" value={user.email} className="input" disabled />
        </div>
      </div>
    </div>
  );
}

export default User;
