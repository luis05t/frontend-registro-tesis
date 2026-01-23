import axios from 'axios';

// 1. CAMBIO PRINCIPAL: Usamos localhost en lugar del túnel
// 2. IMPORTANTE: Agregamos '/api' al final, ya que tu Backend lo requiere
const BASE_URL = "https://xll6l1ct-8000.brs.devtunnels.ms/"; 

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