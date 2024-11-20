import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import useLocalState from "./useLocalState";
import "./Earning.css";
import { useReactToPrint } from "react-to-print";
import { Helmet } from "react-helmet-async";
import { BASE_URL } from "../Service/Service";

function Earning() {
  const CUSTOM_DATE_URL = BASE_URL + "api/customdate";
  const ADMIN_CUSTOM_DATE_URL = BASE_URL + "api/admin/customdate";

  const [user, setUser] = useLocalState("", "user");
  const [jwt, setJwt] = useLocalState("", "jwt");
  const [date1, setDate1] = useState(new Date().toLocaleDateString('en-CA'));
  const [date2, setDate2] = useState(new Date().toLocaleDateString('en-CA'));
  const [details, setDetails] = useState([]);
  const [userProfile, setUserProfile] = useLocalState("", "userProfile");
  const [rate, setRate] = useState(60);
  let role = user.authorities;

  let componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    pageStyle: ` @media print {
      @page {
        size: 72mm full portrait;
        margin: 0;
      }
      .print-button {
        display: none !important;}
    }
    `
  });

  useEffect(() => {
    if (role === "[ROLE_USER]") {
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
          .get(CUSTOM_DATE_URL, config)
          .then((res) => {setDetails(res.data)});
          
      };
      data();
    } else if (role === "[ROLE_ADMIN]") {
      {
        let config = {
          headers: {
            Authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
          },
          params: {
            user_id: userProfile.id,
            date1: date1,
            date2: date2,
          },
        };

        const data = async () => {
          await axios
            .get(ADMIN_CUSTOM_DATE_URL, config)
            .then((res) => setDetails(res.data));
        };
        data();
      }
    }
  }, [date1, date2, userProfile]);

  var total = details.reduce((accum, item) => accum + item.amount, 0);
  var counts = details.reduce((accum, item) => accum + item.count, 0);
  var sum = total - counts;
  var tips = Math.round(details.reduce((accum, item) => accum + item.tip, 0));
  var deduct = Math.round((sum * (100 - rate)) / 100);
  var estimate = Math.round(sum - deduct + tips);
  var payCH = details.reduce((accum, item) => {
    if(item.by === 'CH'){
      return accum + item.amount;
    } else {
      return accum;
    }
  }, 0);
  const fullName = user.firstName + " " + user.lastName;
  return (
    <>
      <Helmet>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Helmet>
      <div style={{maxWidth:"550px"}} className="wrapper">
        <div className="title">Search Date</div>
        <div className="form">
          <div className="inputfield">
            <label>From</label>
            <input
              type="date"
              value={date1}
              onChange={(e) => setDate1(e.target.value)}
              className="input"
            />
          </div>
          <div className="inputfield">
            <label>To</label>
            <input
              type="date"
              value={date2}
              onChange={(e) => setDate2(e.target.value)}
              className="input"
            />
          </div>
          <div className="inputfield">
            <label>Service Count</label>
            <input type="text" value={counts} className="input" disabled />
          </div>

          <div className="inputfield">
            <label>Rate</label>
            <select
              value={rate}
              className="input"
              onChange={(e) => setRate(e.target.value)}
            >
              <option value={60}>60</option>
              <option value={70}>70</option>
              <option value={80}>80</option>
            </select>
          </div>
        </div>
      </div>
      {/* --------------------------  */}
      <div className="receipt">
            {total > 0 && (
        <div style={{paddingBottom:"60px", marginBottom:"60px"}} className="container" ref={componentRef}>
<button className="print-button" onClick={() => handlePrint()}>Print</button>
          <div className="receipt_header">
            <h1>
              Receipt of Labor{" "}
              {role === "[ROLE_USER]" ? (
                <span>{fullName}</span>
              ) : (
                <span>{userProfile.firstName}</span>
              )}
            </h1>
          </div>

          <div className="receipt_body">
            <div className="date_time_con">
              <div className="date">{date1}</div>
              to
              <div className="date">{date2}</div>
            </div>
            <div className="items">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>TIP</th>
                    <th>COUNT</th>
                    <th>AMT</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(details.reduce((acc, detail) => {
                    if (!acc[detail.date]) {
                      acc[detail.date] = { ...detail };
                    } else {
                      acc[detail.date].amount += detail.amount;
                      acc[detail.date].tip += detail.tip;
                      acc[detail.date].count += detail.count;
                    }
                    return acc;
                  }, {})).map(([date, detail]) => (
                    <tr key={date}>
                      <td>{date}</td>
                      <td>{Math.round(detail.tip)}</td>
                      <td>{detail.count}</td>
                      <td>{detail.amount}</td>
                    </tr>
                  ))}
                </tbody>

                <tfoot>
                  <tr>
                    <td>Total</td>
                    <td>{tips}</td>
                    <td></td>
                    <td>{total}</td>
                  </tr>

                  <tr>
                    <td>Service Count</td>
                    <td></td>
                    <td></td>
                    <td>-{counts}</td>
                  </tr>

                  <tr>
                    <td>Deduct</td>
                    <td></td>
                    <td></td>
                    <td>-{deduct}</td>
                  </tr>

                  <tr>
                    <td>Tip</td>
                    <td></td>
                    <td></td>
                    <td>+{tips}</td>
                  </tr>

                  <tr>
                    <td>Earning</td>
                    <td></td>
                    <td></td>
                    <td>{estimate}</td>
                  </tr>
                  <tr>
                    <td>Cash this Period</td>
                    <td></td>
                    <td></td>
                    <td>({payCH})</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          <h3>Thank You!</h3>
        </div>
      )}
      </div>
    </>
  );
}

export default Earning;
