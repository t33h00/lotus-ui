import { useState, useEffect, useContext } from "react";
import useLocalState from "./useLocalState";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { BASE_URL } from "../Service/Service";

function CalViewDetail({ date, id }) {
  const TRANSACTION_URL = BASE_URL + "api/findbydate";
  const ADMIN_TRANSACTION_URL = BASE_URL + "api/admin/findbydate";
  const [details, setDetails] = useState([]);
  const [jwt, setJwt] = useLocalState("", "jwt");
  const navigate = useNavigate();
  const [user, setUser] = useLocalState("", "user");
  let role = user.authorities;
  const [userProfile, setUserProfile] = useLocalState("", "userProfile");
  useEffect(() => {
    if (date !== null) {
      if (role === "[ROLE_USER]") {
        let config = {
          headers: {
            Authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
          },
          params: {
            date: date?.toISOString().slice(0, 10),
          },
        };

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
      } else if (role === "[ROLE_ADMIN]") {
        let config = {
          headers: {
            Authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
          },
          params: {
            id: id,
            date: date?.toISOString().slice(0, 10),
          },
        };

        let data = async () => {
          await axios
            .get(ADMIN_TRANSACTION_URL, config)
            .then((res) => setDetails(res.data));
        };
        data();
      }
    }
  }, [date, userProfile]);
  function handleEdit(id) {
    if (role === "[ROLE_USER]") {
      navigate(`/EditTransaction/${id}`);
    }
  }
  var total = details.reduce((accum, item) => accum + item.amount, 0);
  var tips = (details.reduce((accum, item) => accum + item.tip, 0).toFixed(1));
  var counts = (details.reduce((accum,item)=>accum + item.count,0))

  console.log(details)
  return (
    <>
      <Helmet>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Helmet>
      <div className="content-table wrapper" style={{maxWidth:"550px", paddingBottom:"70px"}}>
        <table className="customers">
          <thead>
              <td>Name</td>
              <td>By</td>
              <td>$$</td>
              <td>Tip</td>
              <td>Ser</td>
              <td>Note</td>
          </thead>
          {details.map((detail) => (
            <tr key={detail.id}>
              <td onDoubleClick={() => handleEdit(detail.id)}>{detail.name}</td>
              <td>{detail.payBy}</td>
              <td>{detail.amount}</td>
              <td>{detail.tip}</td>
              <td>{detail.count}</td>
              <td>{detail.note}</td>
            </tr>
          ))}
          <tr className="foot">
            <td>Total:</td>
            <td></td>
            <td>{total}</td>
            <td>{tips} </td>
            <td>{counts}</td>
            <td></td>
          </tr>
        </table>
      </div>
    </>
  );
}

export default CalViewDetail;