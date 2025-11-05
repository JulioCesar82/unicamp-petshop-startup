import { BaseRepository } from './BaseRepository';
import { BookingRecommendation } from '../domain/entities';

export class BookingRecommendationRepository extends BaseRepository<BookingRecommendation> {
  protected endpoint = 'booking-recommendations';
  protected parentEndpoint = 'tutor';

  constructor(apiVersion: string = 'v1') {
    super(apiVersion);
  }
}