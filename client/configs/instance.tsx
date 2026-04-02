import axios from 'axios'

const base = import.meta.env.DEV
    ? 'http://localhost:8080/api/'
    : 'https://hotel-booking-app-server-eight.vercel.app/api/';

const instanceClient = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL || base
});
export default instanceClient
