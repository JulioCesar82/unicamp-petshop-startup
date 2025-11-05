import '@testing-library/jest-dom';

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock fetch API
const mockFetch = vi.fn();
Object.defineProperty(window, 'fetch', {
  value: mockFetch,
});

// Reset mocks before each test
beforeEach(() => {
  sessionStorageMock.clear();
  mockFetch.mockClear();
});
