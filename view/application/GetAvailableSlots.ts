import { IAvailabilityRepository } from '../domain/repositories';

export class GetAvailableSlots {
  constructor(private availabilityRepository: IAvailabilityRepository) {}

  async execute(date: Date, durationInMinutes: number): Promise<string[]> {
    return this.availabilityRepository.getAvailableSlots(date, durationInMinutes);
  }
}
