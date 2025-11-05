import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryRepository } from './InMemoryRepository';
import { Auditable } from '../domain/interfaces';

interface TestEntity extends Auditable {
  id: string | number;
  name: string;
  value: number;
  nenabled: boolean;
}

describe('InMemoryRepository', () => {
  let repository: InMemoryRepository<TestEntity>;
  const initialData: TestEntity[] = [
    {
      id: 1,
      name: 'Item A',
      value: 10,
      dcreated: '2023-01-01T00:00:00Z',
      dlastupdate: '2023-01-01T00:00:00Z',
      nenabled: true,
    },
    {
      id: 2,
      name: 'Item B',
      value: 20,
      dcreated: '2023-01-02T00:00:00Z',
      dlastupdate: '2023-01-02T00:00:00Z',
      nenabled: true,
    },
    {
      id: 3,
      name: 'Item C',
      value: 15,
      dcreated: '2023-01-03T00:00:00Z',
      dlastupdate: '2023-01-03T00:00:00Z',
      nenabled: false,
    },
  ];

  beforeEach(() => {
    repository = new InMemoryRepository<TestEntity>(initialData);
  });

  it('should find an item by ID', async () => {
    const item = await repository.findById(1);
    expect(item).toEqual(initialData[0]);
  });

  it('should return null if item not found by ID', async () => {
    const item = await repository.findById(99);
    expect(item).toBeNull();
  });

  it('should find all items with default pagination', async () => {
    const result = await repository.findAll();
    expect(result.data).toEqual(initialData);
    expect(result.pagination).toEqual({ page: 1, pageSize: 10, total: 3 });
  });

  it('should apply pagination', async () => {
    const result = await repository.findAll({ page: 1, pageSize: 2 });
    expect(result.data).toEqual([initialData[0], initialData[1]]);
    expect(result.pagination).toEqual({ page: 1, pageSize: 2, total: 3 });

    const result2 = await repository.findAll({ page: 2, pageSize: 2 });
    expect(result2.data).toEqual([initialData[2]]);
    expect(result2.pagination).toEqual({ page: 2, pageSize: 2, total: 3 });
  });

  it('should apply filtering', async () => {
    const result = await repository.findAll({ filter: { name: 'Item A' } });
    expect(result.data).toEqual([initialData[0]]);

    const result2 = await repository.findAll({ filter: { nenabled: false } });
    expect(result2.data).toEqual([initialData[2]]);
  });

  it('should apply sorting', async () => {
    const result = await repository.findAll({ sort: { value: 'desc' } });
    expect(result.data[0].value).toBe(20);
    expect(result.data[1].value).toBe(15);
    expect(result.data[2].value).toBe(10);
  });

  it('should apply selection (projection)', async () => {
    const result = await repository.findAll({ select: ['name'] });
    expect(result.data).toEqual([
      { name: 'Item A' },
      { name: 'Item B' },
      { name: 'Item C' },
    ]);
  });

  it('should create a new item', async () => {
    const newItem: Partial<TestEntity> = { name: 'Item D', value: 25 };
    const createdItem = await repository.create(newItem);

    expect(createdItem.name).toBe('Item D');
    expect(createdItem.id).toBe(4);
    expect(await repository.findById(4)).toEqual(createdItem);
  });

  it('should update an existing item', async () => {
    const updatedItem = await repository.update(1, { name: 'Updated Item A' });
    expect(updatedItem.name).toBe('Updated Item A');
    expect(updatedItem.dlastupdate).not.toBe(initialData[0].dlastupdate);
    expect(await repository.findById(1)).toEqual(updatedItem);
  });

  it('should throw error if item to update not found', async () => {
    await expect(repository.update(99, { name: 'Nonexistent' })).rejects.toThrow(
      'Item with id 99 not found.'
    );
  });

  it('should delete an item', async () => {
    await repository.delete(1);
    expect(await repository.findById(1)).toBeNull();
  });

  it('should throw error if item to delete not found', async () => {
    await expect(repository.delete(99)).rejects.toThrow(
      'Item with id 99 not found.'
    );
  });
});
