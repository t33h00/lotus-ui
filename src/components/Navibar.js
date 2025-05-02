import React, { useState } from "react";
import "./navibar.css";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { logout } from "../Service/Service";

function Navibar() {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current path
  const [value, setValue] = useState(0);
  const mili = new Date().getTime() - 21600000;
  const today = new Date(mili).toJSON().slice(0, 10);

  const handleLogout = () => {
    logout(navigate);
  };

  const handleNavigationChange = (event, newValue) => {
    setValue(newValue);
    const paths = [
      `/transaction/${today}`,
      "/calendarview",
      "/earning",
      "/user"
    ];
    navigate(paths[newValue]);
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
          {location.pathname !== "/login" && (
            <a onClick={handleLogout}>Logout</a>
          )}
        </div>
      </div>
      <div>
        <BottomNavigation
          showLabels
          value={value}
          onChange={handleNavigationChange}
          sx={{
            position: "fixed",
            zIndex: 1000,
            justifyContent: "center",
            bottom: 0,
            left: "50%",
            transform: "translateX(-50%)",
            bgcolor: "white",
            marginBottom: "30px",
            borderRadius: "20px",
            boxShadow: "0px 0px 20px 0px rgba(65, 39, 65, 0.47);",
            height: "60px",
            maxWidth: "550px",
            width: "100%",
            "& .Mui-selected": {
              "& .MuiBottomNavigationAction-label": {
                fontSize: (theme) => theme.typography.caption,
                transition: "ease-in-out",
                fontWeight: "bold",
                lineHeight: "20px",
                paddingBottom: "5px",
              },
              "& .MuiSvgIcon-root, & .MuiBottomNavigationAction-label": {
                color: "#5265c4",
              },
            },
          }}
        >
          <BottomNavigationAction label="record" icon={<EditNoteIcon />} aria-label="Record" />
          <BottomNavigationAction label="calendar" icon={<CalendarMonthIcon />} aria-label="Calendar" />
          <BottomNavigationAction label="wage" icon={<AttachMoneyIcon />} aria-label="Wage" />
          <BottomNavigationAction label="profile" icon={<MoreHorizIcon />} aria-label="Profile" />
        </BottomNavigation>
      </div>
    </>
  );
}

export default Navibar;