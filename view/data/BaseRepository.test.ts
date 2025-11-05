import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BaseRepository } from './BaseRepository';
import { apiClient } from './apiClient';
import { Auditable } from '../domain/interfaces';

// Mock apiClient
vi.mock('./apiClient', () => ({
  apiClient: vi.fn(),
  HttpError: class HttpError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
}));

interface TestEntity extends Auditable {
  id: string | number;
  name: string;
  value: number;
}

class TestRepository extends BaseRepository<TestEntity> {
  protected endpoint = 'test-entities';
}

describe('BaseRepository', () => {
  let repository: TestRepository;

  beforeEach(() => {
    repository = new TestRepository();
    vi.mocked(apiClient).mockClear();
  });

  it('should call apiClient with correct URL for findById', async () => {
    const mockEntity: TestEntity = {
      id: '1',
      name: 'Test 1',
      value: 10,
      dcreated: '',
      dlastupdate: '',
      nenabled: true,
    };
    vi.mocked(apiClient).mockResolvedValue(mockEntity);

    const result = await repository.findById('1');

    expect(apiClient).toHaveBeenCalledWith('/test-entities/1', { version: 'v1' });
    expect(result).toEqual(mockEntity);
  });

  it('should return null for findById if 404 HttpError', async () => {
    vi.mocked(apiClient).mockRejectedValue(new (await import('./apiClient')).HttpError('Not Found', 404));

    const result = await repository.findById('999');

    expect(apiClient).toHaveBeenCalledWith('/test-entities/999', { version: 'v1' });
    expect(result).toBeNull();
  });

  it('should call apiClient with correct URL and params for findAll', async () => {
    const mockResponse = {
      data: [],
      pagination: { page: 1, pageSize: 10, total: 0 },
    };
    vi.mocked(apiClient).mockResolvedValue(mockResponse);

    const options = { page: 2, pageSize: 5, select: ['name'], filter: { value: 10 }, sort: { name: 'asc' } };
    const result = await repository.findAll(options);

    expect(apiClient).toHaveBeenCalledWith(
      '/test-entities',
      expect.objectContaining({
        version: 'v1',
        params: {
          page: '2',
          pageSize: '5',
          select: 'name',
          'filter[value]': 10,
          'sort[name]': 'asc',
        },
      })
    );
    expect(result).toEqual(mockResponse);
  });

  it('should call apiClient with correct URL and body for create', async () => {
    const newItem: Partial<TestEntity> = { name: 'New Test', value: 20 };
    const createdItem: TestEntity = {
      id: '2',
      ...newItem,
      dcreated: '',
      dlastupdate: '',
      nenabled: true,
    } as TestEntity;
    vi.mocked(apiClient).mockResolvedValue(createdItem);

    const result = await repository.create(newItem);

    expect(apiClient).toHaveBeenCalledWith('/test-entities', {
      method: 'POST',
      body: JSON.stringify(newItem),
      version: 'v1',
    });
    expect(result).toEqual(createdItem);
  });

  it('should call apiClient with correct URL and body for update', async () => {
    const updatedItem: Partial<TestEntity> = { name: 'Updated Test' };
    const returnedItem: TestEntity = {
      id: '1',
      name: 'Updated Test',
      value: 10,
      dcreated: '',
      dlastupdate: '',
      nenabled: true,
    };
    vi.mocked(apiClient).mockResolvedValue(returnedItem);

    const result = await repository.update('1', updatedItem);

    expect(apiClient).toHaveBeenCalledWith('/test-entities/1', {
      method: 'PUT',
      body: JSON.stringify(updatedItem),
      version: 'v1',
    });
    expect(result).toEqual(returnedItem);
  });

  it('should call apiClient with correct URL for delete', async () => {
    vi.mocked(apiClient).mockResolvedValue(undefined);

    await repository.delete('1');

    expect(apiClient).toHaveBeenCalledWith('/test-entities/1', {
      method: 'DELETE',
      version: 'v1',
    });
  });
});
