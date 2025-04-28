import { useState, useEffect, useContext, useRef } from "react";
import useLocalState from "./useLocalState";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BASE_URL } from "../Service/Service";
import React from "react";
import { useReactToPrint } from "react-to-print";
import PrivateRoute from "./PrivateRoute";

function CalViewDetail({ date, updateReport}) {
  const TRANSACTION_URL = BASE_URL + "user/findbydate";
  const SAVE_REPORT = BASE_URL + "user/report";
  const [details, setDetails] = useState([]);
  const navigate = useNavigate();
  const [user,setUser] = useLocalState("", "user");
  const [isFormSent, setIsFormSent] = useState(false);
  let convertDate =date?.toISOString().slice(0, 10);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState({
    date: convertDate,
    sent: true,
  });

  let config = {
    params: {
      date: convertDate,
    },
    withCredentials: true
  };

  let componentRef = useRef();
  const handlePrint = useReactToPrint({
      content: () => componentRef.current,
      pageStyle: `
        @media print {
          @page {
            size: 72mm auto; /* Set the page size for thermal printers */
            margin: 0; /* Remove default margins */
          }
          body {
            -webkit-print-color-adjust: exact; /* Ensure colors are printed accurately */
            margin: 0; /* Remove body margin */
          }
          .printBtn, .non-printable {
            display: none !important; /* Hide non-printable elements */
          }
          .table-header {
            display: none; /* Hide table headers if not needed */
          }
          .customers {
            width: 100%; /* Ensure table fits the page */
            font-size: 12px; /* Adjust font size for readability */
          }
        }
      `,
    });

  const getReport = async () => {
    try {
      await axios
        .get(SAVE_REPORT, config)
        .then((res) => {
          res.data === ""? setIsFormSent (false) : setIsFormSent(true);
        });
    } catch (error) {
      alert("Session Expired! Please login again.");
      navigate("/login");
    }
  }
  useEffect(() => {
    if (date !== null) {
        let data = async () => {
          try{
            await axios
            .get(TRANSACTION_URL, config)
            .then((res) => setDetails(res.data));
          } catch(error){
            alert("Session Expired! Please login again.")
            navigate("/login")
          }
        };
        data();
        getReport();
    }
  }, [date]);

  function handleEdit(id) {
      navigate(`/EditTransaction/${id}`);
  }
  var total = details.reduce((accum, item) => accum + item.amount, 0);
  var tipTotal = details.reduce((accum, item) => accum + item.tip, 0).toFixed(1);
  var serviceTotal = details.reduce((accum, item) => accum + item.count, 0);
  let cashTotal = 0;
  let venmo = 0;
  for (let i = 0; i < details.length; i++) {
    if (details[i].by === "CH") {
      cashTotal += details[i].amount;
    } else if (details[i].by === "VE") {
      venmo += details[i].amount;
    }
  }

  const saveReport = async () => {
    try {
      const updatedReport = {
        ...report,
        date: convertDate,
      };
      updateReport(updatedReport);
      setReport(updatedReport);
      await axios
        .post(SAVE_REPORT, updatedReport, {withCredentials: true})
        .then((res) => {
          setIsFormSent(true);
        });
    } catch (error) {
      alert("Session Expired! Please login again.");
      navigate("/login");
    }
  };

  const sendForm = async () => {
    setLoading(true);
    var proxy_url = 'https://quiet-fjord-27536-22f22dca904a.herokuapp.com/';
    const url = "https://docs.google.com/forms/u/0/d/e/1FAIpQLSfSPwGr9un-2Zqh-t2jRybul-zY8CgRPBm1paOGmKwa3daI5w/formResponse?";
    const urlLy = "https://docs.google.com/forms/u/0/d/e/1FAIpQLSdWSn2gPNivqxcd4ZrdLoxr3KABGc8_O9aQmfupRV-HjTmd4Q/formResponse?";

    const formData = new FormData();
    formData.append("entry.658123266", user.firstName);
    formData.append("entry.127700318", total);
    formData.append("entry.1168683895", tipTotal);
    formData.append("entry.1938661854", 0);
    formData.append("entry.2008968433", serviceTotal);
    formData.append("entry.1444595491_month", convertDate.slice(5,7));
    formData.append("entry.1444595491_day", convertDate.slice(8,10));

    const formDataLy = new FormData();
    formDataLy.append("entry.1949367796", user.firstName);
    formDataLy.append("entry.987390504", total);
    formDataLy.append("entry.375054098", tipTotal);
    formDataLy.append("entry.440271778", serviceTotal);
    formDataLy.append("entry.667356686_month", convertDate.slice(5,7));
    formDataLy.append("entry.667356686_day", convertDate.slice(8,10));
    formDataLy.append("entry.667356686_year", convertDate.slice(0,4));

    try{
      await fetch(proxy_url + url, {
        method: 'POST',
        body: formData,
        // mode: 'no-cors'
      }).then(res => {
        if(res.ok){
          saveReport();
          setIsFormSent(true);
          setLoading(false);
          alert("Form sent successfully!");
        } else {
          alert("Error from else");
          setLoading(false);
        }
      });
    } catch(error){
      alert("Error from Catch");
      setLoading(false);
    }
  };
  
  return (
    <>
      <Helmet>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Helmet>
        <>
          {!loading? (<div style={{ paddingBottom: "70px" }} className="wrapper" ref={componentRef}>
            <div className="titleName">
              {user.firstName}
              <div>
                <button className="printBtn button-same-size" style={{ marginRight: "5px" }} onClick={handlePrint}>
                  Print
                </button>
                <button className="printBtn button-same-size" onClick={sendForm} disabled={isFormSent}>
                  {isFormSent ? "Sent" : "Send"}
                </button>
              </div>
            </div>
            <div className="title">
              <h5 style={{ fontWeight: "400", fontSize:"24px" }}>{convertDate}</h5>
            </div>
            <div className="content-table">
              <table className="customers">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>By</th>
                    <th>$$</th>
                    <th>Tip</th>
                    <th>Ser</th>
                    <th>Note</th>
                  </tr>
                </thead>
                <tbody>
                  {details.map((detail) => (
                    <tr key={detail.id}>
                      <td style={{ fontWeight: "400" }} onDoubleClick={() => handleEdit(detail.id)}>
                        {detail.name.toUpperCase()}
                      </td>
                      {detail.by === "CH" ? <td style={{ fontWeight: "600" }}>{detail.by}</td> : <td>{detail.by}</td>}
                      <td>{detail.amount}</td>
                      <td>{detail.tip}</td>
                      <td>{detail.count}</td>
                      <td>{detail.note}</td>
                    </tr>
                  ))}
                </tbody>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: "bold" }}>Total:</td>
                    <td></td>
                    <td>{total}</td>
                    <td>{tipTotal}</td>
                    <td>{serviceTotal}</td>
                    <td>
                    </td>
                  </tr>
                  </tbody>
              </table>
            </div>
            <div style={{ display: "flex", justifyContent: "center", padding: "5px" }}>
              <div style={{ margin: "auto", fontWeight: "bold" }}>Cash: {cashTotal}</div>
              <div style={{ margin: "auto", fontWeight: "bold" }}>Venmo: {venmo}</div>
            </div>
          </div>) : (<div className="loading"></div>)}
        </>
    </>
  );
}

export default PrivateRoute(CalViewDetail, true);