import { AvailabilityRepository } from '../data/AvailabilityRepository';
import { InMemoryAvailabilityRepository } from '../data/InMemoryAvailabilityRepository'; // Import the specific in-memory mock

export class GetAvailableSlots {
  private readonly availabilityRepository: AvailabilityRepository;

  constructor(availabilityRepository: AvailabilityRepository | undefined, mock: boolean = false) {
    if (mock) {
      // Use the specific InMemoryAvailabilityRepository for mocking
      const inMemoryRepo = new InMemoryAvailabilityRepository([
        '09:00', '10:00', '11:00', '14:00', '15:00', '16:00'
      ]);
      this.availabilityRepository = inMemoryRepo;
    } else if (availabilityRepository) {
      this.availabilityRepository = availabilityRepository;
    } else {
      console.warn("AvailabilityRepository not provided, using a dummy repository. This might indicate a loading issue.");
      this.availabilityRepository = {
        getAvailableSlots: async (date: Date, durationInMinutes: number) => {
          return [];
        }
      } as AvailabilityRepository;
    }
  }

  async execute(date: Date, durationInMinutes: number): Promise<string[]> {
    return this.availabilityRepository.getAvailableSlots(date, durationInMinutes);
  }
}