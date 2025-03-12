import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Create axios instance with the correct backend URL
const api = axios.create({
  baseURL: "https://8b50-177-249-162-57.ngrok-free.app/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper function to get token based on platform
const getToken = async () => {
  if (Platform.OS === "web") {
    // Web environment: use localStorage
    return localStorage.getItem("token");
  } else {
    // Mobile environment: use AsyncStorage
    return await AsyncStorage.getItem("token");
  }
};

// Helper function to set token based on platform
export const setToken = async (token) => {
  if (Platform.OS === "web") {
    // Web environment: use localStorage
    localStorage.setItem("token", token);
  } else {
    // Mobile environment: use AsyncStorage
    await AsyncStorage.setItem("token", token);
  }
};

// Add request interceptor to include JWT token in requests
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
