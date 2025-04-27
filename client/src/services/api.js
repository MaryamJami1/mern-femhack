import axios from 'axios';

const API = axios.create({ baseURL: 'https://mern-femhack-production.up.railway.app' });

export default API;