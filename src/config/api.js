// src/config/api.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "https://protodo-backend-production.up.railway.app/api";

const API = axios.create({
  baseURL: API_BASE,
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// ------- Board APIs -------
export const getBoards = () => API.get("/boards");
export const createBoard = (name) => API.post("/boards", { name });
export const deleteBoard = (id) => API.delete(`/boards/${id}`);
export const archiveBoard = (id) => API.put(`/boards/${id}/archive`);

// ------- Task APIs -------
export const getTasks = (boardId) => API.get(`/tasks/${boardId}`);
export const createTask = (task) => API.post("/tasks", task);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
export const updateTask = (id, updates) => API.put(`/tasks/${id}`, updates);

// ✅ Export both base URL and axios instance
export { API };              // 👈 ADD THIS LINE
export default API_BASE;
