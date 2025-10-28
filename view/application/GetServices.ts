import { Service } from '../domain/entities';
import { IServiceRepository } from '../domain/repositories';

export class GetServices {
  constructor(private serviceRepository: IServiceRepository) {}

  async execute(): Promise<Service[]> {
    return this.serviceRepository.getServices();
  }
}
