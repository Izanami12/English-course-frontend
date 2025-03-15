import axios from 'axios';
import keycloak from './keycloak';

const axiosInstance = axios.create({
  baseURL: "http://localhost/api/v1/",
  headers: {
    "Content-type": "application/json",
  },
});

axiosInstance.interceptors.request.use(async config => {
  try {
    let token = keycloak.token || localStorage.getItem('accessToken');

    // Refresh token if expired or about to expire
    if (keycloak.isTokenExpired(30)) {
      const refreshed = await keycloak.updateToken(30);
      if (refreshed) {
        console.log('Token refreshed before request');
        token = keycloak.token;
        localStorage.setItem('accessToken', keycloak.token);
        localStorage.setItem('refreshToken', keycloak.refreshToken);
      } else {
        console.warn('Token refresh failed, logging in again...');
        keycloak.login(); // Force login if refresh fails
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

  } catch (error) {
    console.error('Failed to handle token', error);
    keycloak.login(); // Redirect to login if token handling fails
  }

  return config;
}, error => {
  return Promise.reject(error);
});

export default axiosInstance;
