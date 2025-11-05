import { apiClient } from './apiClient';

export async function fetchWithRetry<T>(path: string, options: RequestInit = {}): Promise<T> {
  return apiClient<T>(path, options);
}