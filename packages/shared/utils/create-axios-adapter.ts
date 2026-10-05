import type { AxiosInstance } from 'axios';
import type { ApiClient } from '../services/_client';

type ErrorTransformer = (err: unknown) => never;

export function createAxiosAdapter(
  axiosInstance: AxiosInstance,
  onError?: ErrorTransformer,
): ApiClient {
  function handle<T>(promise: Promise<{ data: T }>): Promise<T> {
    return promise.then(r => r.data).catch(err => {
      if (onError) onError(err);
      throw err;
    });
  }

  return {
    get<T>(url: string, params?: Record<string, unknown>) {
      return handle<T>(axiosInstance.get(url, { params }));
    },
    post<T>(url: string, data?: unknown) {
      return handle<T>(axiosInstance.post(url, data));
    },
    patch<T>(url: string, data?: unknown) {
      return handle<T>(axiosInstance.patch(url, data));
    },
    delete<T>(url: string, options?: { data?: unknown }) {
      return handle<T>(axiosInstance.delete(url, options));
    },
  };
}
