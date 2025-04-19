import axios from "axios";

export const BASE_URL = process.env.REACT_APP_BASE_URL;

const LOGOUT_URL = BASE_URL + "auth/logout";
export const logout = async (navigate) => {
  try {
    // Send logout request to the server
    await axios.post(
      LOGOUT_URL,
      {},
      {
        withCredentials: true
      }
    );
    await new Promise((resolve) => {
      localStorage.removeItem("@secure.s.user");
      localStorage.removeItem("user");
      resolve(); // Resolve the promise after state updates
    });

    navigate("/login"); // Redirect after state is cleared
  } catch (error) {
    alert("Session Expired! Please login again.");

    // Navigate to the login page even if the request fails
    navigate("/login");
  }
};