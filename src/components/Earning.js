import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import useLocalState from "./useLocalState";
import "./Earning.css";
import { useReactToPrint } from "react-to-print";
import { Helmet } from "react-helmet-async";
import { BASE_URL } from "../Service/Service";
import PrivateRoute from "./PrivateRoute";

function Earning() {
  const CUSTOM_DATE_URL = BASE_URL + "user/customdate";
  const [user] = useLocalState("", "user"); // removed setUser
  const [date1, setDate1] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [date2, setDate2] = useState(new Date().toLocaleDateString('en-CA'));
  const [details, setDetails] = useState([]);
  const [rate, setRate] = useState(70);
  const [loading, setLoading] = useState(false); // loading state
  const [error, setError] = useState(null); // error state

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

  const LOCAL_CACHE_KEY = "earning_cache";

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    // Try to get cache from localStorage
    let localCache = null;
    try {
      const cacheString = localStorage.getItem(LOCAL_CACHE_KEY);
      if (cacheString) {
        localCache = JSON.parse(cacheString);
      }
    } catch (e) {
      // Ignore JSON parse errors
    }

    if (
      localCache &&
      localCache.date1 === date1 &&
      localCache.date2 === date2 &&
      localCache.details &&
      localCache.details.length > 0
    ) {
      setDetails(localCache.details);
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(CUSTOM_DATE_URL, {
        params: { created_at1: date1, created_at2: date2 },
        withCredentials: true
      });
      setDetails(res.data);
      // Save to localStorage
      localStorage.setItem(
        LOCAL_CACHE_KEY,
        JSON.stringify({ date1, date2, details: res.data })
      );
    } catch (e) {
      setError("Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date1, date2]);

  // Memoized calculations for efficiency
  const total = useMemo(() => details.reduce((accum, item) => accum + item.amount, 0), [details]);
  const counts = useMemo(() => details.reduce((accum, item) => accum + item.count, 0), [details]);
  const sum = useMemo(() => total - counts, [total, counts]);
  const tips = useMemo(() => Math.round(details.reduce((accum, item) => accum + item.tip, 0)), [details]);
  const deduct = useMemo(() => Math.round((sum * (100 - rate)) / 100), [sum, rate]);
  const estimate = useMemo(() => Math.round(sum - deduct + tips), [sum, deduct, tips]);
  const payCH = useMemo(() => details.reduce((accum, item) => {
    if(item.pay_by === 'CH'){
      return accum + item.amount;
    } else {
      return accum;
    }
  }, 0), [details]);
  const fullName = user?.firstName + " " + user?.lastName;
  const check = useMemo(() => Math.round(((sum - deduct) * 60) / 100), [sum, deduct]);
  const cash = useMemo(() => Math.round(sum - deduct) - check, [sum, deduct, check]);

  // Memoize grouped details by date for table rendering
  const groupedDetails = useMemo(() => {
    return Object.entries(details.reduce((acc, detail) => {
      if (!acc[detail.created_at]) {
        acc[detail.created_at] = { ...detail };
      } else {
        acc[detail.created_at].amount += detail.amount;
        acc[detail.created_at].tip += detail.tip;
        acc[detail.created_at].count += detail.count;
      }
      return acc;
    }, {}));
  }, [details]);

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
              onChange={e => setRate(Number(e.target.value))}
            >
              <option value={50}>50</option>
              <option value={60}>60</option>
              <option value={70}>70</option>
              <option value={80}>80</option>
            </select>
          </div>
        </div>
      </div>
      {/* --------------------------  */}
      <div className="receipt">
        {loading && <div style={{textAlign:"center"}}>Loading...</div>}
        {error && <div style={{color:"red", textAlign:"center"}}>{error}</div>}
        {!loading && !error && total > 0 && (
          <div style={{paddingBottom:"60px", marginBottom:"60px"}} className="container" ref={componentRef}>
            <button className="print-button" onClick={() => handlePrint()}>Print</button>
            <div className="receipt_header">
              <h1>
                Receipt of Labor{" "}
                <span>{fullName}</span>
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
                    {groupedDetails.map(([created_at, detail]) => (
                      <tr key={created_at}>
                        <td>{created_at}</td>
                        <td>{Math.round(detail.tip)}</td>
                        <td>{detail.count}</td>
                        <td>{detail.amount}</td>
                      </tr>
                    ))}
                  </tbody>

                  <tfoot>
                    <tr>
                      <td>Earning</td>
                      <td></td>
                      <td></td>
                      <td>{estimate}</td>
                    </tr>
                    <tr>
                      <td>Check</td>
                      <td>{check} +</td>
                      <td>{tips}</td>
                      <td>{check + tips}</td>
                    </tr>
                    <tr>
                      <td>Cash</td>
                      <td></td>
                      <td></td>
                      <td>{cash}</td>
                    </tr>
                    <td>Cash this period</td>
                    <td></td>
                    <td></td>
                    <td>({payCH})</td>
                  </tfoot>
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

export default PrivateRoute(Earning, true);
