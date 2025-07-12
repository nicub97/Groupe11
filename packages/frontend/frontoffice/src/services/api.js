import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // TODO: mettre l'URL API de production ici
  withCredentials: true
});

export default api;
