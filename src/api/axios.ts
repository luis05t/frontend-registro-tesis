import axios from 'axios';

const BASE_URL = "https://xll6l1ct-8000.brs.devtunnels.ms/"; 
// LEER del entorno. Si configuras el túnel en el .env, usará el túnel.
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