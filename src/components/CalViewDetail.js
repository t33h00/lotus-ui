import React, { useState, useEffect, useRef, useCallback } from "react";
import useLocalState from "./useLocalState";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BASE_URL } from "../Service/Service";
import { useReactToPrint } from "react-to-print";
import PrivateRoute from "./PrivateRoute";
import sendIcon from "../image/send.svg";
import sentIcon from "../image/sent.png";
import printIcon from "../image/printer.svg";

function CalViewDetail({ date, updateReport }) {
  const TRANSACTION_URL = BASE_URL + "user/findbydate";
  const SAVE_REPORT = BASE_URL + "user/report";
  const [details, setDetails] = useState([]);
  const navigate = useNavigate();
  const [user] = useLocalState("", "user");
  const [isFormSent, setIsFormSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const convertDate = date?.toISOString().slice(0, 10);

  const report = {
    date: convertDate,
    sent: true,
  };

  const config = {
    params: { date: convertDate },
    withCredentials: true,
  };

  const componentRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    pageStyle: `
      @media print {
        @page {
          size: 72mm auto;
          margin: 0;
        }
        body {
          -webkit-print-color-adjust: exact;
          margin: 0;
          width: auto;
          font-family: Lucida Console;
          font-size: 10px;
          line-height: 1.2;
          color: #000;
          font-weight: 700;
        }
        .printBtn, .non-printable {
          display: none !important;
        }
        .content-table {
          width: auto;
          font-family: Lucida Console;
          font-size: 10px;
          line-height: 1.2;
          color: #000;
          font-weight: 700;
        }
      }
    `,
  });

  const getReport = useCallback(async () => {
    try {
      const res = await axios.get(SAVE_REPORT, config);
      setIsFormSent(res.data !== "");
    } catch (error) {
      alert("Session Expired! Please login again.");
      navigate("/login");
    }
  }, [SAVE_REPORT, config, navigate]);

  const fetchDetails = useCallback(async () => {
    try {
      const res = await axios.get(TRANSACTION_URL, config);
      setDetails(res.data);
    } catch (error) {
      alert("Session Expired! Please login again.");
      navigate("/login");
    }
  }, [TRANSACTION_URL, config, navigate]);

  useEffect(() => {
    if (date) {
      fetchDetails();
      getReport();
    }
  }, [date, fetchDetails, getReport]);

  const handleEdit = (id) => {
    navigate(`/EditTransaction/${id}`);
  };

  const total = details.reduce((accum, item) => accum + item.amount, 0);
  const tipTotal = details.reduce((accum, item) => accum + item.tip, 0).toFixed(1);
  const serviceTotal = details.reduce((accum, item) => accum + item.count, 0);
  let cashTotal = 0;
  let venmo = 0;
  details.forEach((detail) => {
    if (detail.by === "CH") cashTotal += detail.amount;
    else if (detail.by === "VE") venmo += detail.amount;
  });

  const saveReport = useCallback(async () => {
    try {
      updateReport(report);
      await axios.post(SAVE_REPORT, report, { withCredentials: true });
      setIsFormSent(true);
    } catch (error) {
      alert("Session Expired! Please login again.");
      navigate("/login");
    }
  }, [SAVE_REPORT, report, updateReport, navigate]);

  const sendForm = async () => {
    setLoading(true);
    const formData = {
      "entry.658123266": user.firstName,
      "entry.127700318": total,
      "entry.1168683895": tipTotal,
      "entry.1938661854": 0,
      "entry.2008968433": serviceTotal,
      "entry.1444595491_month": convertDate.slice(5, 7),
      "entry.1444595491_day": convertDate.slice(8, 10),
    };
    try {
      await fetch(BASE_URL + "api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      await saveReport();
      setLoading(false);
      alert("Form sent successfully!");
    } catch (error) {
      alert("Error sending form.");
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
      {!loading ? (
        <div style={{ paddingBottom: "70px" }} className="wrapper" ref={componentRef}>
          <div className="titleName">
            {user.firstName}
            <div>
              <button className="printBtn button-same-size" style={{ marginRight: "5px" }} onClick={handlePrint}>
                <img style={{ width: "25px", height: "25px" }} src={printIcon} alt="Print" />
              </button>
              <button className="printBtn button-same-size" onClick={sendForm} disabled={isFormSent}>
                {isFormSent ? (
                  <img style={{ width: "25px", height: "25px" }} src={sentIcon} alt="sent" />
                ) : (
                  <img style={{ width: "25px", height: "25px" }} src={sendIcon} alt="send" />
                )}
              </button>
            </div>
          </div>
          <div className="title">
            <h5 style={{ fontWeight: "400", fontSize: "24px" }}>{convertDate}</h5>
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
                    <td style={detail.by === "CH" ? { fontWeight: "600" } : {}}>{detail.by}</td>
                    <td>{detail.amount}</td>
                    <td>{detail.tip}</td>
                    <td>{detail.count}</td>
                    <td>{detail.note}</td>
                  </tr>
                ))}
                <tr>
                  <td style={{ fontWeight: "bold" }}>Total:</td>
                  <td></td>
                  <td>{total}</td>
                  <td>{tipTotal}</td>
                  <td>{serviceTotal}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div style={{ display: "flex", justifyContent: "center", padding: "5px" }}>
            <div style={{ margin: "auto", fontWeight: "bold" }}>Cash: {cashTotal}</div>
            <div style={{ margin: "auto", fontWeight: "bold" }}>Venmo: {venmo}</div>
          </div>
        </div>
      ) : (
        <div className="loading"></div>
      )}
    </>
  );
}

export default PrivateRoute(CalViewDetail, true);