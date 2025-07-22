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
  const navigate = useNavigate();
  const allDay = true;
  const [details, setDetails] = useState([]);
  const [report, setReport] = useState([]);
  const [date, setDate] = useState(null);
  const [mon,setMon] = useState((new Date().getFullYear()+ "-" + (new Date().getMonth()+1).toString().padStart(2,"0") + "%"));

  const updateReportState = (newReportData) => {
    if (!newReportData || !newReportData.created_at) {
      console.error("Invalid newReportData:", newReportData);
      return;
    }

    // Update the verify state by appending or replacing the data
    const updatedReport = Array.isArray(report)
      ? [...report.filter((item) => item.created_at !== newReportData.created_at), newReportData]
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
      created_at: mon,
    },
    withCredentials: true
  };

  const data = async () => {
    try{
      await axios.get(FINDALL_URL, config).then((res) => {
        setDetails(res.data);
        // Filter report data to only include created_at and sent
        const filteredReport = res.data.map(item => ({
          created_at: item.created_at,
          sent: item.sent
        }));
        setReport(filteredReport);
      });
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
    start: moment(detail.created_at).toDate(),
    end: moment(detail.created_at).toDate(),
  }));
  var total = details.reduce((accum, item) => accum + item.amount, 0);

  const reportMap = report.map((reportItem) => ({
    created_at: reportItem.created_at,
    sent: reportItem.sent
  }));
  
  const eventStyleGetter = (event) => {
  const eventDate = moment(event.start).format('YYYY-MM-DD');
  const report = reportMap.find(r => r.created_at === eventDate);
  const style = {
    backgroundColor: report && report.sent ==='true' ? '#48b064' : '',
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
        <CalViewDetail created_at={date} updateReport = {updateReportState} />
      </div>:<div></div>}
    </>
  );
}

export default PrivateRoute(CalendarView, true);