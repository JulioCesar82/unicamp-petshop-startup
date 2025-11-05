import { IRepository, Auditable, PaginatedResponse, QueryOptions } from '../domain/interfaces';

export class InMemoryRepository<T extends Auditable & { id: string | number }> implements IRepository<T> {
  protected data: T[] = [];
  private nextId: number = 1;

  constructor(initialData: T[] = []) {
    this.data = initialData.map(item => ({
      ...item,
      id: item.id || this.generateId(),
      dcreated: item.dcreated || new Date().toISOString(),
      dlastupdate: item.dlastupdate || new Date().toISOString(),
      nenabled: item.nenabled !== undefined ? item.nenabled : true,
    }));
    this.nextId = Math.max(...this.data.map(item => typeof item.id === 'number' ? item.id as number : 0), 0) + 1;
  }

  private generateId(): number {
    return this.nextId++;
  }

  async findById(id: string | number): Promise<T | null> {
    return this.data.find(item => item.id === id) || null;
  }

  async findAll(options?: QueryOptions): Promise<PaginatedResponse<T>> {
    let filteredData = [...this.data];

    // Apply filtering
    if (options?.filter) {
      filteredData = filteredData.filter(item => {
        return Object.keys(options.filter!).every(key => {
          const filterValue = options.filter![key];
          const itemValue = (item as any)[key];
          if (typeof itemValue === 'string' && typeof filterValue === 'string') {
            return itemValue.toLowerCase().includes(filterValue.toLowerCase());
          } else {
            return itemValue === filterValue;
          }
        });
      });
    }

    // Apply sorting
    if (options?.sort) {
      Object.keys(options.sort).forEach(key => {
        const order = options.sort![key];
        filteredData.sort((a, b) => {
          const aValue = (a as any)[key];
          const bValue = (b as any)[key];
          if (aValue < bValue) return order === 'asc' ? -1 : 1;
          if (aValue > bValue) return order === 'asc' ? 1 : -1;
          return 0;
        });
      });
    }

    // Apply pagination
    const page = options?.page || 1;
    const pageSize = options?.pageSize || 10;
    const total = filteredData.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Apply selection (projection)
    const selectedData = options?.select
      ? paginatedData.map(item => {
          const newItem: Partial<T> = {};
          options.select!.forEach(key => {
            if ((item as any)[key] !== undefined) {
              (newItem as any)[key] = (item as any)[key];
            }
          });
          return newItem as T;
        })
      : paginatedData;

    return {
      data: selectedData,
      pagination: {
        page,
        pageSize,
        total,
      },
    };
  }

  async create(item: Partial<T>): Promise<T> {
    const newItem = {
      ...item,
      id: this.generateId(),
      dcreated: new Date().toISOString(),
      dlastupdate: new Date().toISOString(),
      nenabled: true,
    } as T;
    this.data.push(newItem);
    return newItem;
  }

  async update(id: string | number, item: Partial<T>): Promise<T> {
    const index = this.data.findIndex(dataItem => dataItem.id === id);
    if (index === -1) {
      throw new Error(`Item with id ${id} not found.`);
    }
    const updatedItem = {
      ...this.data[index],
      ...item,
      dlastupdate: new Date().toISOString(),
    };
    this.data[index] = updatedItem;
    return updatedItem;
  }

  async delete(id: string | number): Promise<void> {
    const initialLength = this.data.length;
    this.data = this.data.filter(item => item.id !== id);
    if (this.data.length === initialLength) {
      throw new Error(`Item with id ${id} not found.`);
    }
  }
}
