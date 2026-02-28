import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
    headers: { 'Content-Type': 'application/json' },
});

export const createWebApp = (data) => api.post('/webapps/', data);
export const listWebApps = () => api.get('/webapps/');
export const getWebApp = (id) => api.get(`/webapps/${id}/`);
export const deployWebApp = (id, data) => api.post(`/webapps/${id}/deploy/`, data);
export const getDeployLogs = (id) => api.get(`/webapps/${id}/logs/`);

export default api;
