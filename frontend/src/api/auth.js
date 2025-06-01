import axios from "axios";
import { API_BASE_URL } from './apiConfig'; 

// const BASE_URL = "http://10.0.2.2:5000/auth"; // Android Emulator
// const BASE_URL = "http://192.168.0.116:5000/auth"; // For iPhone on local Wi-Fi

const AUTH_BASE_URL = `${API_BASE_URL}/auth`;

export async function registerUser(payload) {
  const response = await axios.post(`${AUTH_BASE_URL}/register`, {
    username: payload.username,
    email: payload.email,
    password: payload.password,
  });
  return response.data;
}

export async function loginUser(payload) {
  const response = await axios.post(`${AUTH_BASE_URL}/login`, {
    identifier: payload.identifier,
    password: payload.password,
  });
  return response.data;
}
