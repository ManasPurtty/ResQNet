const LOCAL_API_ORIGIN = 'http://localhost:5050';
const PRODUCTION_API_ORIGIN = 'https://resqnet-uav3.onrender.com';

const configuredApiOrigin = import.meta.env.VITE_API_URL?.trim();

export const API_ORIGIN = (
  configuredApiOrigin || (import.meta.env.DEV ? LOCAL_API_ORIGIN : PRODUCTION_API_ORIGIN)
).replace(/\/+$/, '');

export const API_BASE_URL = `${API_ORIGIN}/api`;
