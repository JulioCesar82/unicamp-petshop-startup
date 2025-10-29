import { PetRecommendation, VaccineRecommendation } from '../domain/entities';
import { IBookingReminderRepository } from '../domain/repositories';

export class BookingReminderRepository implements IBookingReminderRepository {
  async getBookingRecommendations(tutorId: string): Promise<PetRecommendation[]> {
    // In a real application, this would check against a calendar API
    console.log(`Getting booking recommendations for tutor ${tutorId}.`);

    const vaccineRecommendations: VaccineRecommendation[] = [
      {
        vaccineName: 'V10',
        recommendedDate: '2024-12-01',
        status: 'Pendente',
        reason: 'Reforço anual',
      },
      {
        vaccineName: 'Raiva',
        recommendedDate: '2024-12-01',
        status: 'Pendente',
        reason: 'Reforço anual',
      },
    ];

    const petRecommendations: PetRecommendation[] = [
      {
        pet: {
          id: '1',
          name: 'Rex',
          species: 'Cachorro',
          breed: 'Labrador',
        },
        recommendations: vaccineRecommendations,
      },
      {
        pet: {
          id: '2',
          name: 'Miau',
          species: 'Gato',
          breed: 'Siamês',
        },
        recommendations: [
            {
                vaccineName: 'V4',
                recommendedDate: '2025-01-15',
                status: 'Pendente',
                reason: 'Primeira dose',
            }
        ],
      },
    ];

    return Promise.resolve(petRecommendations);

    try {
      const response = await fetch(`https://julio471-inf332-hackaton-petshop.hf.space/api/v1/tutor/${tutorId}/booking-recommendations?page=1&pageSize=10`);
      if (!response.ok) {
        throw new Error('Failed to fetch booking recommendations');
      }
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error fetching booking recommendations:', error);
      return [];
    }
  }
}

