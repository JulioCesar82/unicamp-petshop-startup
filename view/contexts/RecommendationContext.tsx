import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRepositories } from './RepositoryContext';
import { useUser } from './UserContext';
import { PetRecommendation, VaccineRecommendation, BookingRecommendation, Pet } from '../domain/entities';

interface DismissedRecommendation {
  id: string | number;
  type: 'vaccine' | 'booking';
}

interface SnoozedRecommendation extends DismissedRecommendation {
  snoozeUntil: number; // Timestamp
}

interface RecommendationContextData {
  petRecommendations: PetRecommendation[];
  loadingRecommendations: boolean;
  dismissRecommendation: (recommendation: VaccineRecommendation | BookingRecommendation, type: 'vaccine' | 'booking') => void;
  snoozeRecommendation: (recommendation: VaccineRecommendation | BookingRecommendation, type: 'vaccine' | 'booking') => void;
}

const RecommendationContext = createContext<RecommendationContextData | undefined>(undefined);

const DISMISSED_KEY = 'dismissedRecommendations';
const SNOOZED_KEY = 'snoozedRecommendations';

export const RecommendationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { vaccineRecommendationRepository, bookingRecommendationRepository } = useRepositories();
  const { tutor, pets: userPets, loading: loadingUser } = useUser(); // Get pets from useUser
  const [petRecommendations, setPetRecommendations] = useState<PetRecommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [dismissed, setDismissed] = useState<DismissedRecommendation[]>(() => {
    const stored = sessionStorage.getItem(DISMISSED_KEY);
    return stored ? JSON.parse(stored) : [];
  });
  const [snoozed, setSnoozed] = useState<SnoozedRecommendation[]>(() => {
    const stored = sessionStorage.getItem(SNOOZED_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    sessionStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed));
  }, [dismissed]);

  useEffect(() => {
    sessionStorage.setItem(SNOOZED_KEY, JSON.stringify(snoozed));
  }, [snoozed]);

  const fetchRecommendations = useCallback(async () => {
    if (!tutor || loadingUser) return;

    setLoadingRecommendations(true);
    try {
      const tutorId = tutor.tutor_id;

      const [vaccineRecsResponse, bookingRecsResponse] = await Promise.all([
        vaccineRecommendationRepository.findAll(undefined, tutorId), // Pass tutorId as parentId
        bookingRecommendationRepository.findAll(undefined, tutorId), // Pass tutorId as parentId
      ]);

      const allVaccineRecs: VaccineRecommendation[] = vaccineRecsResponse.data;
      const allBookingRecs: BookingRecommendation[] = bookingRecsResponse.data;

      const recommendationsByPet: Record<number, PetRecommendation> = {};

      const getOrCreatePetRecommendation = (petId: number) => {

        if (!recommendationsByPet[petId]) {
          const pet = userPets.find(p => p.id === petId);

          if (pet) {
            recommendationsByPet[petId] = {
              pet,
              vaccineRecommendations: [],
              bookingRecommendations: [],
            };
          }
        }

        return recommendationsByPet[petId];
      };

      allVaccineRecs.forEach(rec => {
        const isDismissed = dismissed.some(d => d.id === rec.id && d.type === 'vaccine');
        const isSnoozed = snoozed.some(s => s.id === rec.id && s.type === 'vaccine' && s.snoozeUntil > Date.now());

        if (!isDismissed && !isSnoozed) {
          const petRec = getOrCreatePetRecommendation(rec.petId);
          if (petRec) {
            petRec.vaccineRecommendations.push(rec);
          }
        }
      });

      allBookingRecs.forEach(rec => {
        const isDismissed = dismissed.some(d => d.id === rec.id && d.type === 'booking');
        const isSnoozed = snoozed.some(s => s.id === rec.id && s.type === 'booking' && s.snoozeUntil > Date.now());

        if (!isDismissed && !isSnoozed) {
          const petRec = getOrCreatePetRecommendation(rec.petId);
          if (petRec) {
            petRec.bookingRecommendations.push(rec);
          }
        }
      });

      const activePetRecommendations = Object.values(recommendationsByPet);

      setPetRecommendations(activePetRecommendations);
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    } finally {
      setLoadingRecommendations(false);
    }
  }, [tutor, userPets, loadingUser, dismissed, snoozed, vaccineRecommendationRepository, bookingRecommendationRepository]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const dismissRecommendation = useCallback((recommendation: VaccineRecommendation | BookingRecommendation, type: 'vaccine' | 'booking') => {
    setDismissed(prev => [...prev, { id: recommendation.id, type }]);
  }, []);

  const snoozeRecommendation = useCallback((recommendation: VaccineRecommendation | BookingRecommendation, type: 'vaccine' | 'booking') => {
    const snoozeUntil = Date.now() + 24 * 60 * 60 * 1000; // 24 hours from now
    setSnoozed(prev => [...prev, { id: recommendation.id, type, snoozeUntil }]);
  }, []);

  return (
    <RecommendationContext.Provider
      value={{
        petRecommendations,
        loadingRecommendations,
        dismissRecommendation,
        snoozeRecommendation,
      }}
    >
      {children}
    </RecommendationContext.Provider>
  );
};

export const useRecommendations = () => {
  const context = useContext(RecommendationContext);
  if (context === undefined) {
    throw new Error('useRecommendations must be used within a RecommendationProvider');
  }
  return context;
};
