import axios from 'axios';

// Usamos la URL base de Render tal cual.
// NestJS automáticamente le añade el /api a todas las rutas.
const BASE_URL = "https://backend-registro-tesis.onrender.com";

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