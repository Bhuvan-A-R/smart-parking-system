import axios from "axios";

const API = axios.create({
  baseURL: ["http://localhost:5000/api", "https://easy-parkers-sps.vercel.app:5000/api", "https://npx0wrxr-3000.inc1.devtunnels.ms:5000/api"]
});

export const login = (data) => API.post("/auth/login", data);
export const register = (data) => API.post("/auth/register", data);
