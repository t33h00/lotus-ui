import React from "react";
import { useState, useEffect, useRef } from "react";
import useLocalState from "./useLocalState";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import "./Transaction.css";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BASE_URL } from "../Service/Service";
import { requestForToken } from "./firebase";

function Transaction() {
  const TRANSACTION_URL = BASE_URL + "user/findbydate";
  const SAVE_TRANSACTION = BASE_URL + "user/transaction";
  const [user,setUser] = useLocalState("", "user");
  const { date } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [by, setBy] = useState("CC");
  const mili = new Date().getTime() - 21600000;
  const today = new Date(mili).toJSON().slice(0, 10);
  const [startDate, setStartDate] = useState(date ? date : today);

  useEffect(() => {
    if (user) {
      requestForToken(user);
    }
    data();
  }, [startDate, user]);

  // if (navigator.userAgent.includes("Macintosh" && "Chrome")) {
  //   console.log("Mac Chrome!");
  // } else if (navigator.userAgent.includes("Macintosh" && "Safari")) {
  //   console.log("Mac Safari!");
  // }

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

  const data = async () => {
    try {
      const response = await axios.get(TRANSACTION_URL, {
        params: {
          date: startDate,
        },
        withCredentials: true, // Ensure cookies are sent with the request
      });
      if (response.status === 200) {
        setDetails(response.data);
      }
    } catch (error) {
      alert("Session Expired! Please login again.");
      navigate("/login");
    }
  };

  const handleDateChange = (e) => {
    if (e.target.value !== null) {
      setStartDate(e.target.value);
      navigate(`/transaction/${e.target.value}`);
    } else {
      navigate(`/transaction/${startDate}`);
    }
  };

  const [transaction, setTransaction] = useState({
    id: "",
    name: "",
    amount: "",
    tip: "",
    count: "",
    by: by,
    note: "",
    date: startDate,
  });

  const handleChange = (e) => {
    const value = e.target.value;
    setTransaction({ ...transaction, [e.target.name]: value });
  };

  const saveTransaction = async () => {
    try {
      await axios.post(SAVE_TRANSACTION, transaction, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true, // Ensure cookies are sent with the request
      }).then((res) => {
        if (res.status === 200) {
          setLoading(!loading);
          data();
        }
      });
    } catch (error) {
      console.log(error);
      alert("Session Expired! Please login again.");
      navigate("/login");
    }
  };

  const handleClear = () => {
    setTransaction({
      id: "",
      name: "",
      amount: "",
      tip: "",
      count: "",
      by: "CC",
      note: "",
      date: startDate,
    });
  };

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

  return (
    <>
      <Helmet>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Helmet>
      <div className="wrapper">
        <div className="title"> Transaction </div>
        <div className="form">
          <div className="inputfield">
            <input
              placeholder="Name"
              type="text"
              className="input"
              name="name"
              onChange={(e) => handleChange(e)}
              value={transaction.name}
            />
          </div>
          <div className="small-box" style={{ display: "flex" }}>
            <div className="inputfield small-field">
              <div style={{ width: "55px" }} className="custom_select">
                <select
                  name="by"
                  value={transaction.by}
                  onChange={(e) => {
                    handleChange(e);
                    setBy(e.target.value);
                  }}
                >
                  <option value="CC">CC</option>
                  <option value="CH">CH</option>
                  <option value="VE">VE</option>
                  <option value="ZE">ZE</option>
                  <option value="GC">GC</option>
                </select>
              </div>
            </div>
            <div style={{ width: "auto" }} className="inputfield small-field">
              <input
                type="number"
                pattern="[0-9]*"
                placeholder="$"
                className="input"
                name="amount"
                onChange={(e) => handleChange(e)}
                value={transaction.amount}
              />
            </div>
            <div style={{ width: "auto" }} className="inputfield small-field">
              <input
                type="number"
                pattern="[0-9]*"
                placeholder="Tip"
                name="tip"
                className="input"
                value={transaction.tip}
                onChange={(e) => handleChange(e)}
              />
            </div>
            <div style={{ width: "auto" }} className="inputfield small-field">
              <input
                type="number"
                pattern="[0-9]*"
                placeholder="Service"
                name="count"
                className="input"
                value={transaction.count}
                onChange={(e) => handleChange(e)}
              />
            </div>
            <div className="inputfield small-field" style={{ width: "auto" }}>
              <input
                type="date"
                className="input"
                name="date"
                onChange={(e) => {
                  handleChange(e);
                  handleDateChange(e);
                }}
                value={startDate}
                required
              />
            </div>
          </div>
          <div className="inputfield">
            <input
              placeholder="Note"
              name="note"
              type="text"
              className="input"
              value={transaction.note}
              onChange={(e) => handleChange(e)}
            />
          </div>
          <div className="inputfield">
            <input
              type="button"
              onClick={(e) => {
                saveTransaction();
                handleClear();
              }}
              value="Save"
              className="btn"
              disabled={!transaction.name || !transaction.amount || !transaction.count}
            />
          </div>
        </div>
      </div>
      {/* ----------------------------- */}
      {total !== 0 ? (
        <>
          <div style={{ paddingBottom: "70px" }} className="wrapper" ref={componentRef}>
            <div className="titleName">
              {user.firstName}
              <button className="printBtn button-same-size" style={{ float: "right" }} onClick={handlePrint}>
                Print
              </button>
            </div>
            <div className="title">
              <h5 style={{ fontWeight: "bold" }}>{transaction.date}</h5>
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
                    <tr key={detail.name}>
                      <td style={{ fontWeight: "600"}} onDoubleClick={() => handleEdit(detail.id)}>
                        {detail.name.toUpperCase()}
                      </td >
                      {detail.by === "CH" ? <td style={{ fontWeight: "600" }}>{detail.by}</td> : <td >{detail.by}</td>}
                      
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
        </>
      ) : (
        <div></div>
      )}
    </>
  );
}

export default Transaction;