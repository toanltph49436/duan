import axios from 'axios'

const base = import.meta.env.DEV
    ? 'https://duan-ftu0.onrender.com'
    //sdfgsdfsdfds
    : 'https://hotel-booking-app-server-eight.vercel.app/api/';

const instanceClient = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL || base
});
export default instanceClient
