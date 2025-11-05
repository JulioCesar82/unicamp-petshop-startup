export interface Auditable {
  dcreated: string;
  dlastupdate: string;
  nenabled: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface QueryOptions {
  page?: number;
  pageSize?: number;
  select?: string[]; // Columns to project
  filter?: Record<string, any>; // Filtering criteria
  sort?: Record<string, 'asc' | 'desc'>; // Sorting criteria
}

export interface IRepository<T extends Auditable> {
  findById(id: string | number): Promise<T | null>;
  findAll(options?: QueryOptions): Promise<PaginatedResponse<T>>;
  create(item: Partial<T>): Promise<T>;
  update(id: string | number, item: Partial<T>): Promise<T>;
  delete(id: string | number): Promise<void>;
}
