export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||      
  process.env.REACT_APP_API_BASE_URL ||        
  "http://192.168.0.116:8080";                 
//"http://10.0.2.2:5000/auth"; // Android Emulator
//"http://192.168.0.116:5000/auth"; // For iPhone on local Wi-Fi
// "https://orbital-teamyiz-backend.onrender.com";  // for deployment