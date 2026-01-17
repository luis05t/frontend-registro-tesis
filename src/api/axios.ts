import axios from 'axios';


const BASE_URL = "http://localhost:8000"; 

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true // Importante para cookies/sesiones si las usas
});

// Interceptor opcional para incluir el token automáticamente en todas las peticiones
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;