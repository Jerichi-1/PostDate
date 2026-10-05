import axios from "axios";

const API_BASE = import.meta.env.DEV ? "http://localhost:5000/api" : "/api";
export const API_ORIGIN = import.meta.env.DEV ? "http://localhost:5000" : "";
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 15000,
  headers: { "X-Postdate-Request": "1" },
});
export default api;
