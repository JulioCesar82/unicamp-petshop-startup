import { API_CONFIG } from '../config';

const MAX_RETRIES = 3;
const INITIAL_DELAY_MS = 1000;
const MAX_DELAY_MS = 10000;
const TIMEOUT_MS = 10000;

export class HttpError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

async function fibonacciBackoff(n: number): Promise<void> {
  const delay = Math.min(INITIAL_DELAY_MS * Math.pow(2, n), MAX_DELAY_MS);
  return new Promise(resolve => setTimeout(resolve, delay));
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface ApiResponse<T> {
  data: T[];
  pagination: Pagination;
}

export interface ApiClientOptions extends RequestInit {
  version?: string;
  params?: Record<string, any>;
}

export async function apiClient<T>(path: string, options: ApiClientOptions = {}): Promise<T> {
  let attempts = 0;
  const { version = API_CONFIG.version, params, ...fetchOptions } = options;

  while (attempts < MAX_RETRIES) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const url = new URL(`${API_CONFIG.baseURL}/${version}${path}`);
      if (params) {
        Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
      }

      const response = await fetch(url.toString(), {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_CONFIG.apiKey,
          ...fetchOptions.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new HttpError(`Request failed with status ${response.status}`, response.status);
      }

      return await response.json() as T;
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        console.error('Request timed out.');
      }

      if (error instanceof HttpError && (error.status === 401 || error.status === 403 || error.status >= 500)) {
        // Do not retry on authentication or server errors
        throw error;
      }

      attempts++;
      if (attempts >= MAX_RETRIES) {
        throw error;
      }
      await fibonacciBackoff(attempts);
    }
  }

  throw new Error('Max retries reached');
}
