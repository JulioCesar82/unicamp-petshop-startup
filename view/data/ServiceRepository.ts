import { BaseRepository } from './BaseRepository';
import { Service } from '../domain/entities';

export class ServiceRepository extends BaseRepository<Service> {
  protected endpoint = 'service';
}