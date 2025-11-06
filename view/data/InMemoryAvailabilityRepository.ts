import { InMemoryRepository } from './InMemoryRepository';
import { AvailableSlot } from '../domain/entities'; // Assuming AvailableSlot is defined here
import { AvailabilityRepository } from './AvailabilityRepository'; // Import the concrete class to ensure type compatibility

// This class will act as a mock for the AvailabilityRepository
export class InMemoryAvailabilityRepository extends InMemoryRepository<AvailableSlot> implements AvailabilityRepository {

  constructor(initialSlots: string[] = []) {
    // Initialize with mock AvailableSlot entities
    const initialData: AvailableSlot[] = initialSlots.map(time => ({
      id: time, // Using time as a simple ID for mock
      time: time,
      available: true,
      dcreated: new Date().toISOString(),
      dlastupdate: new Date().toISOString(),
      nenabled: true,
    }));
    super(initialData); // Pass initial data to InMemoryRepository constructor
  }

  // Override the getAvailableSlots method to return mock data
  async getAvailableSlots(date: Date, durationInMinutes: number): Promise<string[]> {
    // In a real mock, you might add logic to filter by date/duration
    // For now, just return all pre-configured mock times from the internal data
    return this.data.filter(slot => slot.available).map(slot => slot.time);
  }
}
