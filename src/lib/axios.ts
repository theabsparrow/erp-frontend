import { config } from "@/config";
import axios, { type InternalAxiosRequestConfig } from "axios";
import { clearAuth, getStoredToken, isTokenExpired, saveAuth } from "@/lib/auth";

// ── Public instance — no auth headers, no credentials (login, etc.) ──────────
export const publicAxios = axios.create({
  baseURL: config.vite_base_api as string,
  headers: { "Content-Type": "application/json" },
});

// ── Private instance — handles auth + token refresh ──────────────────────────
const axiosInstance = axios.create({
  baseURL: config.vite_base_api as string,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ── Token refresh state ──────────────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}[] = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
}

async function refreshAccessToken(): Promise<string> {
  const { data } = await axios.post<{ data: { accessToken: string } }>(
    `${config.vite_base_api}/auth/refresh-token`,
    {},
    { withCredentials: true }
  );
  const newToken = data.data.accessToken;
  saveAuth(newToken);
  return newToken;
}

function forceLogout() {
  clearAuth();
  window.location.href = "/login";
}

// ── Request interceptor: proactively refresh expired token ───────────────────
axiosInstance.interceptors.request.use(
  async (cfg: InternalAxiosRequestConfig) => {
    const token = getStoredToken();

    // No token at all — let the request go as-is (will 401 if protected)
    if (!token) return cfg;

    if (isTokenExpired(token)) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newToken = await refreshAccessToken();
          processQueue(null, newToken);
          cfg.headers["Authorization"] = newToken;
        } catch (err) {
          processQueue(err, null);
          forceLogout();
          return Promise.reject(err);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Another request is already refreshing — queue this one
        const newToken = await new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        });
        cfg.headers["Authorization"] = newToken;
      }
    } else if (token) {
      cfg.headers["Authorization"] = token;
    }

    return cfg;
  }
);

// ── Response interceptor: handle unexpected 401 ──────────────────────────────
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            original.headers["Authorization"] = token;
            resolve(axiosInstance(original));
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    try {
      const newToken = await refreshAccessToken();
      processQueue(null, newToken);
      original.headers["Authorization"] = newToken;
      return axiosInstance(original);
    } catch (err) {
      processQueue(err, null);
      forceLogout();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
