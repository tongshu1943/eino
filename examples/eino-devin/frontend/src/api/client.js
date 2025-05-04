import axios from 'axios';
import config from './config';

const apiClient = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
