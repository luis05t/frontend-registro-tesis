import axios from 'axios';

// La URL base debe incluir el /api UNA SOLA VEZ.
// Tu backend en NestJS espera recibir las peticiones en /api/...
const BASE_URL = "https://backend-registro-tesis.onrender.com/api";

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