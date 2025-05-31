// frontend/src/api/auth.js
import axios from "axios";

// const BASE_URL = "http://10.0.2.2:5000/auth"; // Android Emulator
const BASE_URL = "http://192.168.0.116:5000/auth"; // For iPhone on local Wi-Fi


export async function registerUser(payload) {
  const response = await axios.post(`${BASE_URL}/register`, {
    username: payload.username,
    email: payload.email,
    password: payload.password,
  });
  return response.data;
}

export async function loginUser(payload) {
  const response = await axios.post(`${BASE_URL}/login`, {
    identifier: payload.identifier,
    password: payload.password,
  });
  return response.data;
}
