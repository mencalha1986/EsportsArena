import axios from 'axios';
import { useAuth } from './useAuth';

const BASE_URL = import.meta.env.VITE_API_URL as string ?? 'http://localhost:5000';

export function useApi() {
  const { token } = useAuth();

  const api = axios.create({ baseURL: BASE_URL });

  api.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  return api;
}
