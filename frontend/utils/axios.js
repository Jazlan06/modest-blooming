// utils/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000/api',
  withCredentials: true
});

export default instance;
