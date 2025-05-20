import React, { useState, useEffect, useRef, useCallback } from "react";
import useLocalState from "./useLocalState";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import "./Transaction.css";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BASE_URL } from "../Service/Service";
import { requestForToken } from "./firebase";
import PrivateRoute from "./PrivateRoute";
import printIcon from "../image/printer.svg";

function Transaction() {
  const TRANSACTION_URL = BASE_URL + "user/findbydate";
  const SAVE_TRANSACTION = BASE_URL + "user/transaction";
  const [user] = useLocalState("", "user");
  const { date } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState([]);
  const mili = new Date().getTime() - 21600000;
  const today = new Date(mili).toJSON().slice(0, 10);
  const [startDate, setStartDate] = useState(date ? date : today);

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
          font-family: Lucida Console;
          font-size: 10px !important;
          line-height: 1.2;
          color: #000;
          font-weight: 600;
          width: 100vw;
        }
        .printBtn, .non-printable {
          display: none !important;
        }
        .content-table {
          width: 100vw;
          font-family: Lucida Console;
          font-size: 10px !important;
          line-height: 1.2;
          color: #000;
          font-weight: 600;
        }
      }
    `,
  });

  const data = useCallback(async () => {
    try {
      const response = await axios.get(TRANSACTION_URL, {
        params: { date: startDate },
        withCredentials: true,
      });
      if (response.status === 200) {
        setDetails(response.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Session Expired! Please login again.");
      navigate("/login");
    }
  }, [TRANSACTION_URL, startDate, navigate]);

  useEffect(() => {
    if (user) {
      requestForToken(user);
    }
    data();
  }, [startDate, user, data]);

  const handleDateChange = (e) => {
    const value = e.target.value || startDate;
    setStartDate(value);
    navigate(`/transaction/${value}`);
  };

  const [transaction, setTransaction] = useState({
    id: "",
    name: "",
    amount: "",
    tip: "",
    count: "",
    by: "CC",
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
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });
      data();
      handleClear();
    } catch (error) {
      console.error("Error saving transaction:", error);
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

  const total = details.reduce((accum, item) => accum + item.amount, 0);
  const tipTotal = details.reduce((accum, item) => accum + item.tip, 0).toFixed(1);
  const serviceTotal = details.reduce((accum, item) => accum + item.count, 0);
  let cashTotal = 0;
  let venmo = 0;
  details.forEach((detail) => {
    if (detail.by === "CH") cashTotal += detail.amount;
    if (detail.by === "VE") venmo += detail.amount;
  });

  return (
    <>
      <Helmet>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Helmet>
      <div className="wrapper">
        <div className="title">Transaction</div>
        <div className="form">
          <div className="inputfield">
            <input
              placeholder="Name"
              type="text"
              className="input"
              name="name"
              onChange={handleChange}
              value={transaction.name}
            />
          </div>
          <div className="small-box" style={{ display: "flex" }}>
            <div className="inputfield small-field">
              <div style={{ width: "55px" }} className="custom_select">
                <select
                  name="by"
                  value={transaction.by}
                  onChange={handleChange}
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
                placeholder="$"
                className="input"
                name="amount"
                onChange={handleChange}
                value={transaction.amount}
              />
            </div>
            <div style={{ width: "auto" }} className="inputfield small-field">
              <input
                type="number"
                placeholder="Tip"
                name="tip"
                className="input"
                onChange={handleChange}
                value={transaction.tip}
              />
            </div>
            <div style={{ width: "auto" }} className="inputfield small-field">
              <input
                type="number"
                placeholder="Service"
                name="count"
                className="input"
                onChange={handleChange}
                value={transaction.count}
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
              onChange={handleChange}
              value={transaction.note}
            />
          </div>
          <div className="inputfield">
            <input
              type="button"
              onClick={saveTransaction}
              value="Save"
              className="btn"
              disabled={!transaction.name || !transaction.amount || !transaction.count}
            />
          </div>
        </div>
      </div>
      {total !== 0 && (
        <>
          <div style={{ paddingBottom: "70px" }} className="wrapper" ref={componentRef}>
            <div className="titleName">
              {user.firstName}
              <div>
                <button
                  className="printBtn button-same-size"
                  style={{ float: "right" }}
                  onClick={handlePrint}
                >
                  <img style={{ width: "25px", height: "25px" }} src={printIcon} alt="Print" />
                </button>
              </div>
            </div>
            <div className="title">
              <h5 style={{ fontWeight: "400", fontSize: "24px" }}>{transaction.date}</h5>
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
                      <td style={{ fontWeight: "500" }} onDoubleClick={() => handleEdit(detail.id)}>
                        {detail.name.toUpperCase()}
                      </td>
                      {detail.by === "CH" ? (
                        <td style={{ fontWeight: "600" }}>{detail.by}</td>
                      ) : (
                        <td>{detail.by}</td>
                      )}
                      <td>{detail.amount}</td>
                      <td>{detail.tip}</td>
                      <td>{detail.count}</td>
                      <td>{detail.note}</td>
                    </tr>
                  ))}
                </tbody>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: "500" }}>TOTAL:</td>
                    <td></td>
                    <td>{total}</td>
                    <td>{tipTotal}</td>
                    <td>{serviceTotal}</td>
                    <td>
                      <div>Cash: {cashTotal}</div>
                      <div>Venmo: {venmo}</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ display: "flex", justifyContent: "center", padding: "5px" }}>
              
            </div>
          </div>
        </>
        )}
    </>
  );
}

export default PrivateRoute(Transaction, true);