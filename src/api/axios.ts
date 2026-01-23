import axios from 'axios';

// URL base sin añadidos
export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
    // IMPORTANTE: Aquí no ponemos /api, lo manejaremos en la variable de entorno
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

// Función para imágenes (mantiene la base sin /api)
export const getImageUrl = (imageName: string) => {
    if (!imageName) return '/default-avatar.png';
    if (imageName.startsWith('http')) return imageName;
    return `${BASE_URL}/uploads/${imageName}`;
};

export default api;