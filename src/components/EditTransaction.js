import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./Transaction.css";
import axios from "axios";
import useLocalState from "./useLocalState";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BASE_URL } from "../Service/Service";

const payType = [
  {value: "CH", label:"CH"},
  {value: "CC", label:"CC"},
  {value: "ZE", label:"ZE"},
  {value: "VE", label:"VE"},
  {value: "GC", label:"GC"},
]

function EditTransaction() {
    const TRANSACTION_URL = BASE_URL + "user/transaction";
    const UPDATE_URL = BASE_URL + "user/edittransaction";
    const DELETE_URL = BASE_URL + "user/deletetransaction";
    const { id } = useParams();
    const navigate = useNavigate();
    const[transaction,setTransaction] = useState([])
    
    let config = {
      params: {
          id: id
      },
      withCredentials: true
      }

    const fetchData = async () => {
      try{
        await axios.get(TRANSACTION_URL, config)
                  .then((res)=>{
                    setTransaction(res.data);
                  });
                  } catch(error){
                    alert("Session Expired! Please login again.")
                    navigate("/login")
                  }}
        useEffect(()=>{
          fetchData();
        },[]);

  const editTransaction = async () =>{
    try{  await axios.put(UPDATE_URL,transaction,config);
        navigate(-1);
    }catch(error){
        alert("Session Expired! Please login again.")
        navigate("/login")
    }
  }

  const deleteTransaction = async () =>{
    let config = {
        params: {
            id: id
        },
        withCredentials: true
    }
    try{  await axios.delete(DELETE_URL,config);
        navigate(-1);
    }catch(error){
        alert("Session Expired! Please login again.")
        navigate("/login")
    }
  }

  const handleChange = (e) => {
        let value = e.target.value;
        setTransaction({...transaction, [e.target.name]:value})
  
  };

  return (
    <>
    <Helmet>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
      </Helmet>
    <div>
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
          <div className="small-box" style={{display:"flex"}}>
            <div className="inputfield small-field">
              <div style={{ width: "75px" }} className="custom_select">
                <select name="by" value={transaction.by}
                  onChange={(e) => { handleChange(e);}}
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
            <div className="inputfield small-field">
              <input
                type="date"
                style={{ width: "auto" }}
                className="input"
                name="date"
                onChange={(e) => {
                  handleChange(e);
                }}
                value={transaction.date}
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
          <div>
            <div className="inputfield">
                <input
                type="button"
                onClick={() => {
                    editTransaction();
                }}
                value="Save"
                className="btn"
                />
            </div>
            <div className="inputfield">
            <input
              type="button"
              onClick={() => {
                deleteTransaction();
              }}
              value="Delete"
              className="btn"
            />
          </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default EditTransaction;
