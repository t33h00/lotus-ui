import React, { useEffect, useState} from "react";
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

function EmployeeList() {
  const EMPLOYEES_URL = BASE_URL + "api/admin/users";
  const CALENDAR_URL = BASE_URL + "api/admin/calendarview";
  const [jwt] = useLocalState("", "jwt");
  const [details, setDetails] = useState([]);
  const [detailsById, setDetailsById] = useState([]);
  const [loading, setLoading] = useState(true);
  const allDay = true;
  const [date, setDate] = useState(null);
  const [userProfile,setUserProfile] = useLocalState("","userProfile");

  const data = async () => {
    let config = {
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
    };
    await axios.get(EMPLOYEES_URL, config).then((res) => setDetails(res.data));
    setLoading(false);
  };

  const calData = async () => {
    let config = {
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      params: {
        user_id: userProfile.id,
      },
    };
    await axios
      .get(CALENDAR_URL, config)
      .then((res) => setDetailsById(res.data));
  };

  useEffect(() => {
    data();
    calData();
  }, [userProfile]);

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

  const calendarMap = detailsById.map((detail) => ({
    title: detail.amount,
    allDay: allDay,
    start: moment(detail.date).toDate(),
    end: moment(detail.date).toDate(),
  }));

  const setEmployee= (e)=>{
    setUserProfile(details[e]);
  }

  return (

      loading? <div>...loading </div> : (
      <>
      <Helmet>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
      </Helmet>
      <div className="input-field">
          <select onChange={(e) => setEmployee(e.target.value)}>
          <option>Select Employee</option>
            {details.map((detail,index) => (
              <option key={detail.id} value={index}>
                {detail.firstName}
              </option>
            ))}
          </select>
      </div>
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
          style={{ height: 350, margin: "20px" }}
        />
      </div>
      <div>
        <CalViewDetail date={date} id={userProfile.id} />
      </div>
      </>
      )
  );
}

export default EmployeeList;
