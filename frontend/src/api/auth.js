import axios from "axios";
import { API_BASE_URL } from './apiConfig'; 



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
