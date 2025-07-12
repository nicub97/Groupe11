import axios from "axios";

const api = axios.create({
  VITE_API_URL=http://localhost:8000/api # TODO: changer cette URL avec celle de l'API en production
  withCredentials: true
});

export default api;
