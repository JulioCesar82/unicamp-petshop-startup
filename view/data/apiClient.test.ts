import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient, HttpError } from './apiClient';
import { API_CONFIG } from '../config';

// Mock the global fetch function
const mockFetch = vi.fn();
Object.defineProperty(global, 'fetch', {
  value: mockFetch,
  writable: true,
});

describe('apiClient', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    API_CONFIG.baseURL = 'http://test-api.com/api';
    API_CONFIG.version = 'v1';
    API_CONFIG.apiKey = 'test-api-key';
  });

  it('should fetch data successfully', async () => {
    const mockResponse = { message: 'Success' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponse),
    });

    const result = await apiClient('/test');

    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://test-api.com/api/v1/test',
      expect.objectContaining({
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'test-api-key',
        },
      })
    );
  });

  it('should handle query parameters correctly', async () => {
    const mockResponse = { data: [] };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponse),
    });

    await apiClient('/items', { params: { page: 1, pageSize: 10 } });

    expect(mockFetch).toHaveBeenCalledWith(
      'http://test-api.com/api/v1/items?page=1&pageSize=10',
      expect.any(Object)
    );
  });

  it('should throw HttpError for non-ok responses', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'Not Found' }),
    });

    await expect(apiClient('/nonexistent')).rejects.toThrow(HttpError);
    await expect(apiClient('/nonexistent')).rejects.toHaveProperty('status', 404);
  });

  it('should retry on network errors or server errors (>=500) and eventually succeed', async () => {
    const mockResponse = { message: 'Success after retry' };

    // Simulate a network error (e.g., TypeError) then a 500, then success
    mockFetch
      .mockRejectedValueOnce(new TypeError('Network error'))
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ message: 'Server Error' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

    const result = await apiClient('/retry');

    expect(result).toEqual(mockResponse);
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });

  it('should not retry on 401 or 403 errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Unauthorized' }),
    });

    await expect(apiClient('/auth')).rejects.toThrow(HttpError);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should apply custom headers', async () => {
    const mockResponse = { message: 'Success' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponse),
    });

    await apiClient('/custom-header', {
      headers: { 'X-Custom-Header': 'value' },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'x-api-key': 'test-api-key',
          'X-Custom-Header': 'value',
        }),
      })
    );
  });

  it('should use a different API version if specified', async () => {
    const mockResponse = { message: 'Success v2' };
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockResponse),
    });

    await apiClient('/data', { version: 'v2' });

    expect(mockFetch).toHaveBeenCalledWith(
      'http://test-api.com/api/v2/data',
      expect.any(Object)
    );
  });
});
