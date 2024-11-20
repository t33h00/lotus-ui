import React, { useState } from "react";
import "./navibar.css";
import useLocalState from "./useLocalState";
import {Navigate, Link, useNavigate} from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import MuiBottomNavigationAction from "@mui/material/BottomNavigationAction";
import EditNoteIcon from '@mui/icons-material/EditNote';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { styled } from "@mui/material/styles";

function Navibar(){
    const [user,setUser] = useLocalState("","user")
    const [jwt,setJwt] = useLocalState("","jwt")
    const [userProfile,setUserProfile] = useLocalState("","userProfile");
    const mili = new Date().getTime() - 21600000;
    const today = new Date(mili).toJSON().slice(0, 10);
    const [value, setValue] = useState(0); 
    const navigate = useNavigate();
    let role = user.authorities;
    const logout = () => {
        setJwt("");
        setUser("");
        setUserProfile("");
        <Navigate to = "/login"/>
    }

    const handleNavigationChange = (event, newValue) => {
        setValue(newValue);
        switch (newValue) {
            case 0:
              handleTransaction();
              break;
            case 1:
              handleCalendar();
              break;
            case 2:
              handleWage();
              break;
              case 3:
              handleProfile();
              break;
          }};
    const handleTransaction = ()=> {
        if(user !== null){
            navigate("/transaction/" + `${today}`);
        } else {
            navigate("/login");
        }
    }

    const handleCalendar = ()=> {
        navigate("/calendarview");
    }

    const handleWage= ()=> {
        navigate("/earning");
    }

    const handleProfile = ()=> {
        navigate("/user");
    }
    

    return (
         <>
         <div className="Navbar">
            <span className="nav-logo"><a style={{fontSize:"20px"}} href={"/transaction/" + `${today}`} >Lotus</a></span>
            <div className="nav-logo">
                {/* <a href="/user">Profile</a>
                {role==='[ROLE_ADMIN]' && <a href="/employeelist">Employees</a>}
                {role==='[ROLE_USER]' && <a href="/calendarview">Calendar View</a>}
                {role==='[ROLE_USER]' && <a href="/transaction">Transaction</a>}
                {role==='[ROLE_USER]' ? <a href="/earning">Earning</a> : <a href="/earning">Wage Cal</a>} */}
                {user? <a onClick={()=>logout()}>Logout</a> : <a href="/login">Login</a>}
                
            </div>
            {/* <div className={`nav-toggle ${isOpen && "open"}`} onClick={()=>setIsOpen(!isOpen)}>
                <div className="bar"></div>
            </div> */}
        </div>
        <div>
            <BottomNavigation
              showLabels
              value={value}
              onChange={handleNavigationChange}
              sx={{
                position: 'fixed',
                justifyContent: 'center',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                bgcolor: "white",
                marginBottom: '30px',
                borderRadius: '20px',
                boxShadow: '0px 0px 20px 0px rgba(65, 39, 65, 0.47);',
                height: '60px',
                maxWidth: '550px',
                width: '100%',
                '& .Mui-selected': {
                  '& .MuiBottomNavigationAction-label': {
                    fontSize: theme => theme.typography.caption,
                    transition: 'ease-in-out',
                    fontWeight: 'bold',
                    lineHeight: '20px',
                    paddingBottom: '5px',
                  },
                  '& .MuiSvgIcon-root, & .MuiBottomNavigationAction-label': {
                    color: "#5265c4"
                  }
                }
              }}
            >
              <BottomNavigationAction label="record" icon={<EditNoteIcon />} />
              <BottomNavigationAction label="calendar" icon={<CalendarMonthIcon />} />
              <BottomNavigationAction label="wage" icon={<AttachMoneyIcon />} />
              <BottomNavigationAction label="profile" icon={<MoreHorizIcon />} />
            </BottomNavigation>
        </div>
        </>
    )
}

export default Navibar;