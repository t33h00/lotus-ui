import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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

function CalViewDetail({ created_at, updateReport }) {
  const TRANSACTION_URL = BASE_URL + "user/findbydate";
  const SAVE_REPORT = BASE_URL + "user/report";
  const [details, setDetails] = useState([]);
  const navigate = useNavigate();
  const [user] = useLocalState("", "user");
  const [isFormSent, setIsFormSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const convertDate = created_at?.toISOString().slice(0, 10);

  // Memoize config and report so their references don't change on every render
  const config = useMemo(() => ({
    params: { created_at: convertDate },
    withCredentials: true,
  }), [convertDate]);

  const report = useMemo(() => ({
    created_at: convertDate,
    sent: true,
  }), [convertDate]);

  const componentRef = useRef();

  const handlePrint = useReactToPrint({
          content: () => componentRef.current,
          documentTitle: 'receipt',
          pageStyle: `
            @page {
              size: 72mm auto;
              margin: 0;
            }
            @media print {
              html, body {
                width: 72mm !important;
                min-width: 72mm !important;
                max-width: 72mm !important;
                margin: 0 !important;
                padding: 0 !important;
                box-sizing: border-box;
                background: #fff !important;
              }
              body, .wrapper, .content-table, .customers, table, th, td {
                font-family: "Lucida Console", "Courier New", Courier, monospace !important;
                font-size: 11px !important;
                line-height: 1.2 !important;
                color: #000 !important;
                font-weight: 550 !important;
                background: #fff !important;
              }
              .printBtn, .non-printable {
                display: none !important;
              }
              .wrapper, .content-table, .customers {
                width: 72mm !important;
                min-width: 72mm !important;
                max-width: 72mm !important;
                box-sizing: border-box;
                box-shadow: none !important;
                margin: 0 !important;
                padding-right: 6px !important; /* add a little right padding */
                padding-left: 0 !important;
                padding-top: 0 !important;
                padding-bottom: 0 !important;
              }
              table {
                table-layout: fixed !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                border-spacing: 0 !important;
                border-collapse: collapse !important;
              }
              thead,th, td {
                width: auto !important;
                margin: 0 !important;
                padding: 0 !important;
                text-align: left !important;
              }
              .customers tr {
                height: 30px !important; /* add vertical spacing between rows */
              }
              .small{
                width: 10% !important;}
              .note{
                width: 35% !important;}  
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
    if (created_at) {
      fetchDetails();
      getReport();
    }
  }, [created_at, fetchDetails, getReport]);

  const handleEdit = (id) => {
    navigate(`/EditTransaction/${id}`);
  };

  const total = details.reduce((accum, item) => accum + item.amount, 0);
  const tipTotal = details.reduce((accum, item) => accum + item.tip, 0).toFixed(1);
  const serviceTotal = details.reduce((accum, item) => accum + item.count, 0);
  let cashTotal = 0;
  let venmo = 0;
  details.forEach((detail) => {
    if (detail.pay_by === "CH") cashTotal += detail.amount;
    else if (detail.pay_by === "VE") venmo += detail.amount;
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
            <h5 style={{ fontWeight: "400", fontSize: "24px",color: "black" }}>{convertDate}</h5>
          </div>
          <div className="content-table">
            <table className="customers">
              <thead>
                <tr>
                  <th className="space">Name</th>
                    <th className="small">By</th>
                    <th className="small">$$</th>
                    <th className="small">Tip</th>
                    <th className="small">Ser</th>
                    <th className="note">Note</th>
                </tr>
              </thead>
              <tbody>
                {details.map((detail) => (
                  <tr key={detail.id}>
                    <td style={{ fontWeight: "400" }} onDoubleClick={() => handleEdit(detail.id)}>
                      {detail.name.toUpperCase()}
                    </td>
                    <td style={detail.pay_by === "CH" ? { fontWeight: "600" } : {}}>{detail.pay_by}</td>
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