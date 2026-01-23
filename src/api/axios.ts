import axios from 'axios';

// ATENCIÓN: No pongas "/api" al final de esta URL. 
// Tu backend en NestJS ya añade "/api" automáticamente a todas las rutas.
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