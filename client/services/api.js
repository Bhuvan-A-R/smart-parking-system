import axios from "axios";

const API = axios.create({
  baseURL: ["http://localhost:5000/api", "https://easy-parkers-sps.vercel.app/api"][Number(process.env.REACT_APP_API_URL === "production")],
  headers: {
    "Content-Type": "application/json",
  },
});

export const login = (data) => API.post("/auth/login", data);
export const register = (data) => API.post("/auth/register", data);
