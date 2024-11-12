import React, { useEffect, useState } from "react";
// import "./SaleReport.css";
import useLocalState from "./useLocalState";
import axios from "axios";
import "handsontable/dist/handsontable.full.min.css";
import { HotTable } from "@handsontable/react";
import { Helmet } from "react-helmet";
import { BASE_URL } from "../Service/Service";

function SaleReport() {
  const [user, setUser] = useLocalState("", "user");
  const [userProfile, setUserProfile] = useLocalState("", "useLocalState");
  const [jwt, setJwt] = useLocalState("", "jwt");
  const [details, setDetails] = useState([]);
  const [date1, setDate1] = useState(new Date().toJSON().slice(0, 10));
  const [date2, setDate2] = useState(new Date().toJSON().slice(0, 10));

  let config = {
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    params: {
      date1: date1,
      date2: date2,
    },
  };

  const data = async () => {
    await axios
      .get(BASE_URL + "api/admin/report", config)
      .then((res) => setDetails(res.data));
  };

  useEffect(() => {
    data();
  }, [date1, date2]);
  
  return (
    <>
      <div class="wrapper">
        <div class="title">Search Date</div>
        <div class="form">
          <div class="inputfield">
            <label>From</label>
            <input
              type="date"
              value={date1}
              onChange={(e) => setDate1(e.target.value)}
              class="input"
            />
          </div>
          <div class="inputfield">
            <label>To</label>
            <input
              type="date"
              value={date2}
              onChange={(e) => setDate2(e.target.value)}
              class="input"
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default SaleReport;
