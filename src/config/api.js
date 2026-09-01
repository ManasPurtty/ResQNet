const LOCAL_API_ORIGIN = 'http://localhost:5050';
const PRODUCTION_API_ORIGIN = 'https://resqnet-uav3.onrender.com';
const RETIRED_API_ORIGINS = new Set([
  'https://resqnet-tuv3.onrender.com'
]);

const configuredApiOrigin = import.meta.env.VITE_API_URL?.trim().replace(/\/+$/, '');
const usableConfiguredOrigin = (
  import.meta.env.PROD && RETIRED_API_ORIGINS.has(configuredApiOrigin)
) ? undefined : configuredApiOrigin;

export const API_ORIGIN = (
  usableConfiguredOrigin || (import.meta.env.DEV ? LOCAL_API_ORIGIN : PRODUCTION_API_ORIGIN)
);

export const API_BASE_URL = `${API_ORIGIN}/api`;
