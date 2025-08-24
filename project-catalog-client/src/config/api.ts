import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt");

  if (token) {
    if (isTokenExpired(token)) {
      console.log("Token expired. Logging out...");
      localStorage.removeItem("jwt");
      window.location.href = "/login";
    }
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    // If the response is successful, just return it
    return response;
  },
  (error) => {
    // Check if the error is a 401 Unauthorized response
    if (error.response && error.response.status === 401) {
      console.log("Token expired. Logging out...");
      localStorage.removeItem("jwt");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

function decodeJwtPayload(token: any) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT payload:", error);

    return null;
  }
}

function isTokenExpired(token: any) {
  const payload = decodeJwtPayload(token);

  if (!payload || !payload.exp) {
    // If there's no payload or expiration claim, assume it's invalid.
    return true;
  }

  // The 'exp' claim is in Unix time (seconds).
  // Date.now() returns milliseconds, so we need to convert.
  const currentTime = Date.now() / 1000;

  return payload.exp < currentTime;
}

export default api;
