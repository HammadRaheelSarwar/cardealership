import axios from 'axios';
import { useAuthStore } from '@/store/authStore';

// ─── Axios Instance ───────────────────────────────────────────────────────────

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '').replace(/\/api\/v1$/, '')}/api/v1`
    : '/api/v1',
  withCredentials: true, // Required for httpOnly refresh token cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Attaches the access token and active dealership ID to every request

api.interceptors.request.use((config) => {
  const { accessToken, activeDealershipId } = useAuthStore.getState();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  if (activeDealershipId) {
    config.headers['X-Dealership-Id'] = activeDealershipId;
  }

  return config;
});

// ─── Response Interceptor ─────────────────────────────────────────────────────
// On 401: attempt silent token refresh, then retry original request.
// On second 401: logout.

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  refreshQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token!);
  });
  refreshQueue = [];
}

api.interceptors.response.use(
  (response) => {
    if (
      !response.data ||
      typeof response.data !== 'object' ||
      response.data.success !== true
    ) {
      return Promise.reject(
        new Error(
          'The API returned an invalid response. Check that the backend is deployed and connected.'
        )
      );
    }
    if (
      response.config.method &&
      !['get', 'head', 'options'].includes(response.config.method) &&
      !response.config.url?.startsWith('/auth/')
    ) {
      window.dispatchEvent(new Event('crm:data-changed'));
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already a retry/refresh request
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.startsWith('/auth/')
    ) {
      if (isRefreshing) {
        // Queue subsequent 401s until refresh completes
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh');
        const { accessToken } = data.data;

        useAuthStore.getState().setAccessToken(accessToken);
        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
