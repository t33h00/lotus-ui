import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
import Modal from "./Modal";
import useModal from "./useModal";
import EditTransaction from "./EditTransaction";

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
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const { isOpen: isEditModalOpen, openModal: openEditModal, closeModal: closeEditModal } = useModal();

  const componentRef = useRef();

  // Memoize the print page style to avoid recreating on every render
  const printPageStyle = useMemo(() => `
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
        padding-left: 0 !important;
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
        padding: 0 !important;
        padding-left: 0 !important;
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
  `, []);

  // Print handler for latest react-to-print versions
  const handlePrintAlternative = useCallback(() => {
    if (!componentRef.current) {
      alert('Print content is not ready. Please try again.');
      return;
    }

    const printContent = componentRef.current.innerHTML;
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt</title>
          <style>
            ${printPageStyle.replace('@media print {', '').replace(/}$/, '')}
          </style>
        </head>
        <body>
          ${printContent}
        </body>
        </html>
      `);
      
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    } else {
      alert('Pop-up blocked. Please allow pop-ups and try again.');
    }
  }, [printPageStyle]);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: 'receipt',
    pageStyle: printPageStyle,
    onPrintError: () => handlePrintAlternative()
  });

  const data = useCallback(async () => {
    try {
      const response = await axios.get(TRANSACTION_URL, {
        params: { created_at: startDate },
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
    pay_by: "CC",
    note: "",
    created_at: startDate,
  });

  const handleChange = useCallback((e) => {
    const value = e.target.value;
    setTransaction({ ...transaction, [e.target.name]: value });
  }, [transaction]);

  const saveTransaction = useCallback(async () => {
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
  }, [SAVE_TRANSACTION, transaction, data, navigate]);

  const handleClear = useCallback(() => {
    setTransaction({
      id: "",
      name: "",
      amount: "",
      tip: "",
      count: "",
      pay_by: "CC",
      note: "",
      created_at: startDate,
    });
  }, [startDate]);

  const handleEdit = useCallback((id) => {
    setSelectedTransactionId(id);
    openEditModal();
  }, [openEditModal]);

  const handleCloseEditModal = useCallback(() => {
    closeEditModal();
    setSelectedTransactionId(null);
    data(); // Refresh data after closing modal
  }, [closeEditModal, data]);

  // Memoize expensive calculations
  const calculations = useMemo(() => {
    const total = details.reduce((accum, item) => accum + item.amount, 0);
    const tipTotal = details.reduce((accum, item) => accum + item.tip, 0).toFixed(1);
    const serviceTotal = details.reduce((accum, item) => accum + item.count, 0);
    
    let cashTotal = 0;
    let venmo = 0;
    details.forEach((detail) => {
      if (detail.pay_by === "CH") cashTotal += detail.amount;
      if (detail.pay_by === "VE") venmo += detail.amount;
    });

    return { total, tipTotal, serviceTotal, cashTotal, venmo };
  }, [details]);

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
                  name="pay_by"
                  value={transaction.pay_by}
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
                name="created_at"
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
      {calculations.total !== 0 && (
        <>
          <div style={{ paddingBottom: "70px" }}
            className="wrapper"
            ref={componentRef}
          >
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
              <h5 style={{ fontWeight: "400", fontSize: "24px", color: "black" }}>{transaction.created_at}</h5>
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
                      <td style={{ fontWeight: "500" }} onDoubleClick={() => handleEdit(detail.id)}>
                        {detail.name.toUpperCase()}
                      </td>
                      {detail.pay_by === "CH" ? (
                        <td style={{ fontWeight: "600" }}>{detail.pay_by}</td>
                      ) : (
                        <td>{detail.pay_by}</td>
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
                    <td>{calculations.total}</td>
                    <td>{calculations.tipTotal}</td>
                    <td>{calculations.serviceTotal}</td>
                    <td>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div style={{ display: "flex", justifyContent: "center", padding: "5px" }}>
              <div style={{ margin: "auto", fontWeight: "bold" }}>Cash: {calculations.cashTotal}</div>
              <div style={{ margin: "auto", fontWeight: "bold" }}>Venmo: {calculations.venmo}</div>
            </div>
          </div>
        </>
      )}
      
      <Modal isOpen={isEditModalOpen} onClose={handleCloseEditModal}>
        {selectedTransactionId && (
          <EditTransaction 
            transactionId={selectedTransactionId} 
            onClose={handleCloseEditModal}
          />
        )}
      </Modal>
    </>
  );
}

export default PrivateRoute(Transaction, true);