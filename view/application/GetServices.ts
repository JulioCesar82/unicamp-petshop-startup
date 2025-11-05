import { ServiceRepository } from '../data/ServiceRepository';
import { Service } from '../domain/entities';

export class GetServices {
  constructor(private serviceRepository: ServiceRepository) {}

  async execute(): Promise<Service[]> {
    const response = await this.serviceRepository.findAll();
    return response.data;
  }
}