import { PetRecommendation, Pet } from '../domain/entities';
import { IBookingReminderRepository } from '../domain/repositories';
import { fetchWithRetry } from './api';

interface ApiResponse<T> {
  data: T;
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

export class BookingReminderRepository implements IBookingReminderRepository {
  private pets: Pet[];

  constructor(pets: Pet[] = []) {
    this.pets = pets;
  }

  async getBookingRecommendations(tutorId: string): Promise<PetRecommendation[]> {
    console.log(`Getting booking and vaccine recommendations for tutor ${tutorId}.`);

    try {
      const [bookingData, vaccineData] = await Promise.all([
        fetchWithRetry<ApiResponse<PetRecommendation[]>>(`/tutor/${tutorId}/booking-recommendations`),
        fetchWithRetry<ApiResponse<PetRecommendation[]>>(`/tutor/${tutorId}/vaccine-recommendations`)
      ]);

      const recommendationsMap = new Map<string, PetRecommendation>();

      const processRecommendations = (recs: PetRecommendation[]) => {
        for (const rec of recs) {
          if (recommendationsMap.has(rec.pet_id)) {
            const existingRec = recommendationsMap.get(rec.pet_id)!;
            
            if (!existingRec.recommendations)
              existingRec.recommendations = [];

            existingRec.recommendations.push(rec);
          } else {
            recommendationsMap.set(rec.pet_id, { ...rec });
          }
        }
      };

      if (bookingData?.data) {
        processRecommendations(bookingData.data);
      }
      if (vaccineData?.data) {
        processRecommendations(vaccineData.data);
      }
      
      const enrichedRecommendations = Array.from(recommendationsMap.values()).map(rec => {
        const fullPet = this.pets.find(p => p.id === rec.pet_id);
        return fullPet ? { ...rec, pet: fullPet } : rec;
      });

      return enrichedRecommendations;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
  }
}

