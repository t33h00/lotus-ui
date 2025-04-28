import React, { useEffect, useState, useRef } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import axios from "axios";
import moment from "moment";
import CalViewDetail from "./CalViewDetail";
import "./CalendarView.css";
import { Helmet } from "react-helmet-async";
import { BASE_URL } from "../Service/Service";
import { useNavigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";

function CalendarView() {
  const FINDALL_URL = BASE_URL +  "user/calendarview";
  const SAVE_REPORT = BASE_URL + "user/reportmonth";
  const navigate = useNavigate();
  const allDay = true;
  const [details, setDetails] = useState([]);
  const [report, setReport] = useState([]);
  const [date, setDate] = useState(null);
  const [mon,setMon] = useState((new Date().getFullYear()+ "-" + (new Date().getMonth()+1).toString().padStart(2,"0") + "%"));

  const updateReportState = (newReportData) => {
    if (!newReportData || !newReportData.date) {
      console.error("Invalid newReportData:", newReportData);
      return;
    }

    // Update the verify state by appending or replacing the data
    const updatedReport = Array.isArray(report)
      ? [...report.filter((item) => item.date !== newReportData.date), newReportData]
      : [newReportData];

    setReport(updatedReport);
  };

  function handleMonth(e){
      let year = e.getFullYear();
      let month = e.getMonth()+1;
      setMon(year + "-" + month.toString().padStart(2,"0") + "%");
  }

  let config = {
    params: {
      date: mon,
    },
    withCredentials: true
  };

  const getReport = async () => {
    try {
      await axios
        .get(SAVE_REPORT, config)
        .then((res) => {
          setReport(res.data); // Ensure res.data is set correctly
        });
    } catch (error) {
      alert("Session Expired! Please login again.");
      navigate("/login");
    }
  }

  const data = async () => {
    try{
      await axios.get(FINDALL_URL, config).then((res) => setDetails(res.data));
    } catch (error){
      navigate("/login")
    }
  };

  useEffect(() => {
    getReport();
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

  const reportMap = report.map((reportItem) => ({
    date: reportItem.date,
    sent: reportItem.sent
  }));
  
  const eventStyleGetter = (event) => {
    const eventDate = moment(event.start).format('YYYY-MM-DD');
    const report = reportMap.find(r => r.date === eventDate);
    const style = {
      backgroundColor: report && report.sent ? '#48b064' : '',
      borderRadius: '2px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block'
    };
    return {
      style: style,
    };
  };

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
          style={{ height: 350, margin: "20px"}}
          eventPropGetter={eventStyleGetter}
        />
        <div className="total">
        Total this month: {total}
        </div>
      </div>
      {date? <div>
        <CalViewDetail date={date} updateReport = {updateReportState} />
      </div>:<div></div>}
    </>
  );
}

export default PrivateRoute(CalendarView, true);
