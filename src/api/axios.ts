import axios from 'axios';

// Usamos la URL completa y limpia. 
// No le agregues nada más al final para evitar el error de duplicado.
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