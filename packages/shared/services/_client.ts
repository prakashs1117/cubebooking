/**
 * Platform-agnostic API client interface
 * Implementations provided by web (Axios) and mobile (AsyncStorage + Axios)
 */
export interface ApiClient {
  get<T>(url: string, params?: Record<string, unknown>): Promise<T>;
  post<T>(url: string, data?: unknown): Promise<T>;
  patch<T>(url: string, data?: unknown): Promise<T>;
  delete<T>(url: string, options?: { data?: unknown }): Promise<T>;
}
