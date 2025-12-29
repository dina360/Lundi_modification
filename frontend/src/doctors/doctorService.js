// frontend/src/doctorService.js
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:5000";
const API = `${API_BASE}/api/doctors`;

const authHeader = () => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getDoctors = (params = {}) =>
  axios.get(API, { params, headers: authHeader() }).then(r => r.data);

export const getDoctorById = (id) =>
  axios.get(`${API}/${id}`, { headers: authHeader() }).then(r => r.data);

export const createDoctor = (formData) =>
  axios.post(API, formData, { headers: { ...authHeader(), "Content-Type": "multipart/form-data" } }).then(r => r.data);

export const updateDoctor = (id, formData) =>
  axios.put(`${API}/${id}`, formData, { headers: { ...authHeader(), "Content-Type": "multipart/form-data" } }).then(r => r.data);

export const deleteDoctor = (id) =>
  axios.delete(`${API}/${id}`, { headers: authHeader() }).then(r => r.data);
