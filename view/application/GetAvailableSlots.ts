import { AvailabilityRepository } from '../data/AvailabilityRepository';

export class GetAvailableSlots {
  constructor(private availabilityRepository: AvailabilityRepository) {}

  async execute(date: Date, durationInMinutes: number): Promise<string[]> {
    return this.availabilityRepository.getAvailableSlots(date, durationInMinutes);
  }
}