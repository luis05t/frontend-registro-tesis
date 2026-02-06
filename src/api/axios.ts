import axios from 'axios';

export const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

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

export const getImageUrl = (imageName: string) => {
    if (!imageName) return '/default-avatar.png';
    if (imageName.startsWith('http')) return imageName;
    return `${BASE_URL}/uploads/${imageName}`;
};

export default api;