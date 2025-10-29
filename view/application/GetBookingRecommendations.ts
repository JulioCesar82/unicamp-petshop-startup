import { PetRecommendation } from '../domain/entities';
import { IBookingReminderRepository } from '../domain/repositories';

export class GetBookingRecommendations {
  constructor(private bookingReminderRepository: IBookingReminderRepository) {}

  async execute(tutorId: string): Promise<PetRecommendation[]> {
    return this.bookingReminderRepository.getBookingRecommendations(tutorId);
  }
}
