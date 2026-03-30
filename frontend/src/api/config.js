const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
// Strip trailing slash if exists to prevent double slash errors
const API_URL = base.endsWith('/') ? base.slice(0, -1) : base;

export default API_URL;
