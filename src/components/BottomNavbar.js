import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  PencilSquareIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  UserIcon
} from "@heroicons/react/24/outline";

function BottomNavbar() {
  const navigate = useNavigate();
  const [value, setValue] = useState(0);
  const mili = new Date().getTime() - 21600000;
  const today = new Date(mili).toJSON().slice(0, 10);

  const handleNavigationChange = (newValue, path) => {
    setValue(newValue);
    navigate(path);
  };

  const navItems = [
    { 
      label: "record", 
      path: `/transaction/${today}`, 
      icon: PencilSquareIcon 
    },
    { 
      label: "calendar", 
      path: "/calendarview", 
      icon: CalendarDaysIcon 
    },
    { 
      label: "wage", 
      path: "/earning", 
      icon: CurrencyDollarIcon 
    },
    { 
      label: "profile", 
      path: "/user", 
      icon: UserIcon 
    }
  ];

  return (
    <div style={{
      position: "fixed",
      zIndex: 1000,
      bottom: 0,
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: "white",
      marginBottom: "30px",
      borderRadius: "20px",
      boxShadow: "0px 0px 20px 0px rgba(65, 39, 65, 0.47)",
      height: "60px",
      maxWidth: "550px",
      width: "100%",
      display: "flex",
      justifyContent: "space-around",
      alignItems: "center",
      padding: "0 20px"
    }}>
      {navItems.map((item, index) => {
        const IconComponent = item.icon;
        return (
          <button
            key={index}
            onClick={() => handleNavigationChange(index, item.path)}
            style={{
              backgroundColor: "transparent",
              border: "none",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              padding: "5px",
              color: value === index ? "#5265c4" : "#666",
              fontSize: "12px"
            }}
          >
            <IconComponent 
              style={{ 
                width: "20px", 
                height: "20px", 
                marginBottom: "2px",
                stroke: value === index ? "#5265c4" : "#666"
              }} 
            />
            <span style={{ 
              fontWeight: value === index ? "bold" : "normal",
              fontSize: "10px"
            }}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default BottomNavbar;