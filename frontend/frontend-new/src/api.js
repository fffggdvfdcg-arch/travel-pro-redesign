import axios from "axios";

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api" });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const getMe = () => API.get("/auth/me");

export const getTours = () => API.get("/tours");
export const getTour = (id) => API.get(`/tours/${id}`);
export const createTour = (data) => API.post("/tours", data);
export const updateTour = (id, data) => API.put(`/tours/${id}`, data);
export const deleteTour = (id) => API.delete(`/tours/${id}`);
export const likeTour = (id) => API.post(`/tours/${id}/like`);
export const addTourComment = (id, data) => API.post(`/tours/${id}/comments`, data);

export const getCruises = () => API.get("/cruises");
export const getCruise = (id) => API.get(`/cruises/${id}`);
export const createCruise = (data) => API.post("/cruises", data);
export const updateCruise = (id, data) => API.put(`/cruises/${id}`, data);
export const deleteCruise = (id) => API.delete(`/cruises/${id}`);

export const createBooking = (data) => API.post("/bookings", data);
export const getBookings = () => API.get("/bookings");
export const updateBookingStatus = (id, status) => API.put(`/bookings/${id}/status`, { status });
export const deleteBooking = (id) => API.delete(`/bookings/${id}`);

export const getUsers = () => API.get("/admin/users");
export const banUser = (id) => API.put(`/admin/users/${id}/ban`);
export const unbanUser = (id) => API.put(`/admin/users/${id}/unban`);
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);
export const changeUserRole = (id, role) => API.put(`/admin/users/${id}/role`, { role });

export default API;
