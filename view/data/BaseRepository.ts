import { apiClient, ApiResponse, HttpError } from './apiClient';
import { IRepository, Auditable, PaginatedResponse, QueryOptions } from '../domain/interfaces';
import { API_CONFIG } from '../config';

export abstract class BaseRepository<T extends Auditable> implements IRepository<T> {
  protected abstract endpoint: string;
  protected parentEndpoint?: string;

  constructor(protected apiVersion: string = 'v1') {}

  protected buildPath(id?: string | number, options?: QueryOptions, parentId?: string | number): string {
    let path = '';
    if (this.parentEndpoint && parentId) {
      path += `/${this.parentEndpoint}/${parentId}`;
    }
    path += `/${this.endpoint}`;
    if (id) {
      path += `/${id}`;
    }

    const url = new URL(path, `http://dummy.com`); // Use a dummy base URL for URLSearchParams to work
    if (options?.page) url.searchParams.append('page', options.page.toString());
    if (options?.pageSize) url.searchParams.append('pageSize', options.pageSize.toString());
    if (options?.select) url.searchParams.append('select', options.select.join(','));
    if (options?.filter) {
      Object.keys(options.filter).forEach(key => {
        url.searchParams.append(`filter[${key}]`, options.filter![key]);
      });
    }
    if (options?.sort) {
      Object.keys(options.sort).forEach(key => {
        url.searchParams.append(`sort[${key}]`, options.sort![key]);
      });
    }
    return url.pathname + url.search;
  }

  async findById(id: string | number, parentId?: string | number): Promise<T | null> {
    try {
      const result = await apiClient<T>(this.buildPath(id, undefined, parentId), { version: this.apiVersion });
      return result;
    } catch (error) {
      if (error instanceof HttpError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async findAll(options?: QueryOptions, parentId?: string | number): Promise<PaginatedResponse<T>> {
    const result = await apiClient<ApiResponse<T>>(this.buildPath(undefined, options, parentId), { version: this.apiVersion });
    return result;
  }

  async create(item: Partial<T>, parentId?: string | number): Promise<T> {
    const result = await apiClient<T>(this.buildPath(undefined, undefined, parentId), {
      method: 'POST',
      body: JSON.stringify(item),
      version: this.apiVersion,
    });
    return result;
  }

  async update(id: string | number, item: Partial<T>, parentId?: string | number): Promise<T> {
    const result = await apiClient<T>(this.buildPath(id, undefined, parentId), {
      method: 'PUT',
      body: JSON.stringify(item),
      version: this.apiVersion,
    });
    return result;
  }

  async delete(id: string | number, parentId?: string | number): Promise<void> {
    await apiClient<void>(this.buildPath(id, undefined, parentId), {
      method: 'DELETE',
      version: this.apiVersion,
    });
  }
}