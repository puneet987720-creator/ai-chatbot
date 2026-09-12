import axios from "axios";
import getToken from "../utils/getToken";

const api = axios.create({
  baseURL: "https://ai-chatbot-t5fk.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  }
});

// Add request interceptor to include token from AsyncStorage
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error adding token to request:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;