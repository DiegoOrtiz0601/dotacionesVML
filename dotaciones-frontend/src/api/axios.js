import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Asegúrate que tu backend Laravel corre aquí
  withCredentials: true, // Para incluir cookies en peticiones
  headers: {
    Accept: 'application/json',
  },
})

// Interceptor para incluir el token automáticamente si está en localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
