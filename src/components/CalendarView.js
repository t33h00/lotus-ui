import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import useLocalState from "./useLocalState";
import axios from "axios";
import moment from "moment";
import CalViewDetail from "./CalViewDetail";
import "./CalendarView.css";
import { Helmet } from "react-helmet-async";
import { BASE_URL } from "../Service/Service";
import { useNavigate } from "react-router-dom";

function CalendarView() {
  const FINDALL_URL = BASE_URL +  "api/calendarview";
  const navigate = useNavigate();
  const allDay = true;
  const [jwt, setJwt] = useLocalState("", "jwt");
  const [details, setDetails] = useState([]);
  const [date, setDate] = useState(null);
  const [mon,setMon] = useState((new Date().getFullYear()+ "-" + (new Date().getMonth()+1).toString().padStart(2,"0") + "%"));
  console.log("From CalendarView")

  function handleMonth(e){
      let year = e.getFullYear();
      let month = e.getMonth()+1;
      setMon(year + "-" + month.toString().padStart(2,"0") + "%");
  }

  let config = {
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    params: {
      date: mon,
    },
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${jwt}`,
  };

  const data = async () => {
    try{
      await axios.get(FINDALL_URL, config).then((res) => setDetails(res.data));
    } catch (error){
      navigate("/login")
    }
  };

  useEffect(() => {
    data();
  }, [mon]);

  const locales = {
    "en-US": require("date-fns/locale/en-US"),
  };

  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
  });

  const calendarMap = details.map((detail) => ({
    title: detail.amount,
    allDay: allDay,
    start: moment(detail.date).toDate(),
    end: moment(detail.date).toDate(),
  }));
  var total = details.reduce((accum, item) => accum + item.amount, 0);
  
  return (
    <>
      <Helmet>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
      </Helmet>

      <div className="wrapper">
        <Calendar
          localizer={localizer}
          events={calendarMap}
          startAccessor="start"
          endAccessor="end"
          navLinks={true}
          editable={true}
          selectable={true}
          onSelectEvent={(e) => setDate(e.start)}
          toolbar={true}
          views={["month"]}
          onNavigate={(e)=>handleMonth(e)}
          style={{ height: 350, margin: "20px" }}
        />
        <div style={{textAlign:"center"}}>
        Total this month: {total}
        </div>
      </div>
      {date? <div>
        <CalViewDetail date={date} />
      </div>:<div></div>}
    </>
  );
}

export default CalendarView;
