// apiService.ts
import axios,{AxiosProgressEvent} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {store} from '../../store/Store';
import {BASE_URL_} from '@env';
import getCurrentEnvironment from './envConfig';
import { StorageKeys } from '../../utils/StorageKeys';

// Initialize Axios instance
const axiosClient = axios.create({
  // baseURL: BASE_URL_,
  baseURL: getCurrentEnvironment.baseURL,
  timeout: 20000000,
  headers: {
    'Content-Type': 'application/json',
    device: 'mobile',
    platform: 'android',
  },
});

// Request interceptor to conditionally add token
axiosClient.interceptors.request.use(
  async config => {
    // const state = store.getState();
    // const token = state.auth.token; // Adjust if token is stored elsewhere in your Redux state
    const token = await AsyncStorage.getItem(StorageKeys.token);
    if (token && !config.headers.skipAuth) {
      // Only add Authorization header if skipAuth is not set
      config.headers.Authorization = `Bearer ${token}`;
    }
    // @ts-ignore

    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

// Response interceptor to handle errors globally
axiosClient.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    if (error.response?.status === 401) {
      // Optionally handle 401 errors (e.g., refresh token or logout)
    }
    return Promise.reject(error);
  },
);

// API methods
const apiService = {
  get: (url: string, params = {}, skipAuth = false) => {
    return axiosClient.get(url, {params, headers: {skipAuth}});
  },

  post: (url: string, data: any, skipAuth = false) => {
    return axiosClient.post(url, data, {headers: {skipAuth}});
  },

  put: (url: string, data: any, skipAuth = false) => {
    return axiosClient.put(url, data, {headers: {skipAuth}});
  },

  delete: (url: string, params = {}, skipAuth = false) => {
    return axiosClient.delete(url, {params, headers: {skipAuth}});
  },
  patch: (url: string, data: any, params = {}, skipAuth = false) => {
    return axiosClient.patch(url, data, {params, headers: {skipAuth}});
  },
  posMultipart: (url: string, data: any, headers: {}) => {
    return axiosClient.post(url, data, {headers: headers});
  },
  posMultipartVideo: (
    url: string, // Define as string
    data: FormData, // Define as FormData
    headers: {}, // Define as Axios headers type
     onUploadProgress?: (progressEvent: AxiosProgressEvent) => void, // Optional callback for progress
  ) => {
    return axiosClient.post(url, data, {
      headers,
      onUploadProgress,
    });
  },
};

export default apiService;
