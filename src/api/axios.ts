import axios from 'axios';

// Detecta si estamos en producción para usar la variable de entorno
// Si no, usa localhost.
// NOTA: Agregamos '/api' al final porque tu backend tiene un prefijo global.
const BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : "http://localhost:8000/api";

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true 
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;