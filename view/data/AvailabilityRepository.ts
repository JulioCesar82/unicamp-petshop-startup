import { BaseRepository } from './BaseRepository';

interface AvailableSlot {
  time: string;
  available: boolean;
}

export class AvailabilityRepository extends BaseRepository<AvailableSlot> {
  protected endpoint = 'availability';

  // Custom method to get available slots for a specific date and duration
  async getAvailableSlots(date: Date, durationInMinutes: number): Promise<string[]> {
    const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD
    const response = await this.findAll({
      filter: {
        date: dateString,
        duration: durationInMinutes.toString(),
      },
    });
    return response.data.filter(slot => slot.available).map(slot => slot.time);
  }
}