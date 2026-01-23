import axios from 'axios';

// LEER del entorno. Si configuras el túnel en el .env, usará el túnel.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"; 

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