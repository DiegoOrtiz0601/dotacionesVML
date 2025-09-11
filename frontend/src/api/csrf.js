import axios from 'axios'

export const csrf = () => axios.get('http://localhost:8000/sanctum/csrf-cookie', {
  withCredentials: true
})
