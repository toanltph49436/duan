import axios from 'axios'

// Force reload for axios config - Updated at 2025-01-03
const defaultBase = import.meta.env.DEV
    ? 'http://localhost:8080/api/'
    : 'https://hotel-booking-app-server-eight.vercel.app/api/';

// Normalize custom base URL to always end with /api/
const rawBase = import.meta.env.VITE_BASE_URL || defaultBase;
let normalizedBase = rawBase;
if (!/\/api\/?$/.test(rawBase)) {
    if (rawBase.endsWith('/')) {
        normalizedBase = rawBase + 'api/';
    } else {
        normalizedBase = rawBase + '/api/';
    }
}

console.log('Axios baseURL (normalized):', normalizedBase);

const axiosGuide = axios.create({
    baseURL: normalizedBase
});

// Add request interceptor to include token
axiosGuide.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('hdv_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle token expiration
axiosGuide.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid, redirect to login
            localStorage.removeItem('hdv_token');
            localStorage.removeItem('hdv_refresh_token');
            localStorage.removeItem('hdv_user');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export default axiosGuide
