import React, { useState } from "react";
import "./navibar.css";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import { logout } from "../Service/Service";

function Navibar() {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current path
  const [value, setValue] = useState(0);
  const mili = new Date().getTime() - 21600000;
  const today = new Date(mili).toJSON().slice(0, 10);
  const noShow = ["/login", "/signup", "/reset"];

  const handleLogout = () => {
    logout(navigate);
  };

  return (
    <>
      <div className="Navbar">
        <span className="nav-logo">
          <a style={{ fontSize: "20px" }} href={`/transaction/${today}`}>
            <img src={require("../image/text.png")} alt="Logo" style={{width:"50px"}} />
          </a>
        </span>
        <div className="nav-logo">
          {/* Conditionally render the Logout link */}
          {!noShow.includes(location.pathname) && (
            <a onClick={handleLogout}>Logout</a>
          )}
        </div>
      </div>
    </>
  );
}

export default Navibar;