import axios from "axios";

const API = axios.create({
  baseURL: "https://easy-parkers-sps.vercel.app:5000/api",
});

export const login = (data) => API.post("/auth/login", data);
export const register = (data) => API.post("/auth/register", data);
