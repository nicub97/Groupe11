import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // TODO: mettre l'URL API de production ici
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
