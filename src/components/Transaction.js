import React from "react";
import { useState, useEffect, useRef } from "react";
import useLocalState from "./useLocalState";
import axios from "axios";
import { useReactToPrint } from "react-to-print";
import "./Transaction.css";
import { Navigate, useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BASE_URL } from "../Service/Service";

function Transaction() {
  const TRANSACTION_URL = BASE_URL + "api/findbydate";
  const SAVE_TRANSACTION = BASE_URL + "api/transaction";
  const [user, setUser] = useLocalState("", "user");
  const { date } = useParams();
  const navigate = useNavigate();
  const [details, setDetails] = useState([]);
  const [jwt, setJwt] = useLocalState("", "jwt");
  const [loading, setLoading] = useState(true);
  const [payBy, setPayBy] = useState("CC");
  const mili = new Date().getTime() - 21600000;
  const today = new Date(mili).toJSON().slice(0, 10);
  const [startDate, setStartDate] = useState(today || date);

  useEffect(() => {
      data();
  }, [loading, startDate]);

  let componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    pageStyle: ` @media print {
      @page {
        size: 72mm full portrait;
        margin: 0;
      }
    }
    `
  });

  let config = {
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    params: {
      date: date,
    },
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${jwt}`,
  };

  const data = async () => {
      try {
        const response = await axios
      .get(TRANSACTION_URL, config)
      .then((res) => {
        if(res.status === 200){
          setDetails(res.data)
        }
      })
      } catch(error){
        alert("Session Expired! Please login again.")
        navigate("/login")
      }
  };

  const handleDateChange = (e) => {
    if(e.target.value !== null){
      setStartDate(e.target.value);
    navigate(`/transaction/${e.target.value}`)
    } else {
      navigate(`/transaction/${startDate}`)
    }
  }

  const [transaction, setTransaction] = useState({
    id: "",
    name: "",
    amount: "",
    tip: "",
    count: "",
    payBy: payBy,
    note: "",
    date: startDate,
  });
  const handleChange = (e) => {
    const value = e.target.value;
    setTransaction({ ...transaction, [e.target.name]: value });
  };

  const saveTransaction = async () => {
    try{await
        axios
      .post(SAVE_TRANSACTION, transaction, { headers: headers })
      .then((res) => {
        if (res.status === 200) {
          setLoading(!loading);
          data();
        }
      })} catch(error){
        alert("Session Expired! Please login again.")
        navigate("/login")
      };
  }

  const handleClear = () => {
    setTransaction({
      id: "",
      name: "",
      amount: "",
      tip: "",
      count: "",
      payBy: "CC",
      note: "",
      date: startDate
    });
  };

  function handleEdit(id) {
    navigate(`/EditTransaction/${id}`);
  }

  var total = details.reduce((accum, item) => accum + item.amount, 0);
  var tipTotal = details
    .reduce((accum, item) => accum + item.tip, 0)
    .toFixed(1);
  var serviceTotal = details.reduce((accum, item) => accum + item.count, 0);
  let cashTotal = 0;
  for (let i = 0; i < details.length; i++) {
    if (details[i].payBy === "CH") {
      cashTotal += details[i].amount;
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
      <div className="wrapper" >
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
          <div className="small-box" style={{display:"flex"}}>
            <div className="inputfield small-field">
              <div style={{ width: "55px" }} className="custom_select">
                <select
                  name="payBy"
                  value={transaction.payBy}
                  onChange={(e) => {
                    handleChange(e);
                    setPayBy(e.target.value);
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
                type="number" pattern="[0-9]*"
                placeholder="$"
                className="input"
                name="amount"
                onChange={(e) => handleChange(e)}
                value={transaction.amount}
              />
            </div>
            <div style={{ width: "auto" }} className="inputfield small-field">
              <input
                type="number" pattern="[0-9]*"
                placeholder="Tip"
                name="tip"
                className="input"
                value={transaction.tip}
                onChange={(e) => handleChange(e)}
              />
            </div>
            <div style={{ width: "auto" }} className="inputfield small-field">
              <input
                type="number" pattern="[0-9]*"
                placeholder="Service"
                name="count"
                className="input"
                value={transaction.count}
                onChange={(e) => handleChange(e)}
              />
            </div>
            <div className="inputfield small-field" style={{width: "auto"}}>
              <input
                type="date"
                // style={{ width: "110px",textAlign:"center"
                //  }}
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
            />
          </div>
        </div>
      </div>
      {/* ----------------------------- */}
      {total != 0 ? (
        <>
          <div style={{margin:"20px"}}> 
            <button className="printBtn"
              onClick={handlePrint}
            >
              Print
            </button>
          </div>
          <div style={{paddingBottom:"70px"}} className="wrapper" ref={componentRef}>
            <div className="titleName">{user.firstName}</div>
            <div className="title">
              <h5 style={{ fontWeight: "bold" }}>{startDate}</h5>
            </div>
            <div className="content-table">
              <table className="customers">
                <thead>
                  <td>Name</td>
                  <td>By</td>
                  <td>$$</td>
                  <td>Tip</td>
                  <td>Ser</td>
                  <td>Note</td>
                </thead>
                <tbody>
                  {details.map((detail) => (
                    <tr key={detail.id}>
                      <td  style={{fontWeight:"600"}} onDoubleClick={() => handleEdit(detail.id)}>
                        {(detail.name).toUpperCase()}
                      </td>
                      {detail.payBy==="CH"?<td style={{fontWeight:"600"}}>{detail.payBy}</td>:<td>{detail.payBy}</td>}
                      <td>{detail.amount}</td>
                      <td>{detail.tip}</td>
                      <td>{detail.count}</td>
                      <td>{detail.note}</td>
                    </tr>
                  ))}
                </tbody>

                <td style={{ fontWeight: "bold" }}>Total:</td>
                <td></td>
                <td>{total}</td>
                <td>{tipTotal} </td>
                <td>{serviceTotal}</td>
                <td style={{ fontWeight: "bold" }}>Cash: {cashTotal}</td>
              </table>
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
