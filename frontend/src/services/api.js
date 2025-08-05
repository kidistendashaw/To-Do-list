import axios from "axios";
import { jwtDecode } from "jwt-decode";

const apiClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // Your Django API base URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Axios interceptor to add the auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      const decodedToken = jwtDecode(token);
      // This is the simplified auth from our backend placeholder
      // In a real app with simple-jwt, you'd use the full token
      config.headers.Authorization = `Bearer ${decodedToken.user_id}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
