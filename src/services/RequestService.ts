import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';
import i18next from 'i18next';
import { BACKEND_ENABLED, BackendDisabledError } from '@config/backend/backend.config';

let csrfToken = '';

const NON_DISMISSIBLE_ERROR_CODES = ['SESSION_EXPIRED', 'MAINTENANCE_MODE'];

export function isNonDismissibleErrorCode(code: string): boolean {
  return NON_DISMISSIBLE_ERROR_CODES.includes(code);
}

function notifyError(message: string, code?: string): void {
  if (code && isNonDismissibleErrorCode(code)) return;
  console.error(`[CRM Error${code ? ` ${code}` : ''}] ${message}`);
}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (csrfToken) {
    config.headers.set('X-CSRF-Token', csrfToken);
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    const newToken = response.headers['x-csrf-token'];
    if (typeof newToken === 'string') {
      csrfToken = newToken;
    }
    return response;
  },
  (error: AxiosError<{ code?: string; message?: string }>) => {
    if (error.response?.status === 401) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      return Promise.reject(error);
    }

    const maintenanceHeader = error.response?.headers['x-maintenance-mode'];
    if (maintenanceHeader === 'true') {
      window.location.href = '/maintenance';
      return Promise.reject(error);
    }

    const code = error.response?.data?.code ?? 'UNKNOWN';
    const i18nKey = `errors:networkResponse.code.${code}`;
    const message = i18next.exists(i18nKey)
      ? i18next.t(i18nKey)
      : error.response?.data?.message ?? error.message;

    notifyError(message, code);
    return Promise.reject(error);
  },
);

/** Fails fast (no network, no proxy error) when the backend is disabled. */
function guard(target: string): Promise<void> {
  return BACKEND_ENABLED ? Promise.resolve() : Promise.reject(new BackendDisabledError(target));
}

export const RequestService = {
  get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    return guard(`GET ${url}`).then(() => axiosInstance.get<T>(url, { params })).then((r) => r.data);
  },

  post<T>(url: string, data?: unknown): Promise<T> {
    return guard(`POST ${url}`).then(() => axiosInstance.post<T>(url, data)).then((r) => r.data);
  },

  put<T>(url: string, data?: unknown): Promise<T> {
    return guard(`PUT ${url}`).then(() => axiosInstance.put<T>(url, data)).then((r) => r.data);
  },

  patch<T>(url: string, data?: unknown): Promise<T> {
    return guard(`PATCH ${url}`).then(() => axiosInstance.patch<T>(url, data)).then((r) => r.data);
  },

  delete<T>(url: string): Promise<T> {
    return guard(`DELETE ${url}`).then(() => axiosInstance.delete<T>(url)).then((r) => r.data);
  },

  downloadBlob(url: string): Promise<Blob> {
    return guard(`GET ${url}`)
      .then(() => axiosInstance.get<Blob>(url, { responseType: 'blob' }))
      .then((r) => r.data);
  },
};
