import React, { createContext, useContext, ReactNode } from 'react';
import { BaseRepository } from '../data/BaseRepository';
import { InMemoryRepository } from '../data/InMemoryRepository';
import { IRepository } from '../domain/interfaces';
import { Pet, Tutor, Service, Booking, VaccineRecommendation, BookingRecommendation } from '../domain/entities';
import { API_CONFIG } from '../config';

// Import specific repository implementations
import { PetRepository } from '../data/PetRepository';
import { TutorRepository } from '../data/TutorRepository';
import { ServiceRepository } from '../data/ServiceRepository';
import { BookingRepository } from '../data/BookingRepository';
import { VaccineRecommendationRepository } from '../data/VaccineRecommendationRepository';
import { BookingRecommendationRepository } from '../data/BookingRecommendationRepository';

// Define specific repository types
interface IPetRepository extends IRepository<Pet> {}
interface ITutorRepository extends IRepository<Tutor> {}
interface IServiceRepository extends IRepository<Service> {}
interface IBookingRepository extends IRepository<Booking> {}
interface IVaccineRecommendationRepository extends IRepository<VaccineRecommendation> {}
interface IBookingRecommendationRepository extends IRepository<BookingRecommendation> {}

// Implement In-Memory Repositories (for mocking)
class InMemoryPetRepository extends InMemoryRepository<Pet> implements IPetRepository {}
class InMemoryTutorRepository extends InMemoryRepository<Tutor> implements ITutorRepository {}
class InMemoryServiceRepository extends InMemoryRepository<Service> implements IServiceRepository {}
class InMemoryBookingRepository extends InMemoryRepository<Booking> implements IBookingRepository {}
class InMemoryVaccineRecommendationRepository extends InMemoryRepository<VaccineRecommendation> implements IVaccineRecommendationRepository {}
class InMemoryBookingRecommendationRepository extends InMemoryRepository<BookingRecommendation> implements IBookingRecommendationRepository {}

interface Repositories {
  petRepository: IPetRepository;
  tutorRepository: ITutorRepository;
  serviceRepository: IServiceRepository;
  bookingRepository: IBookingRepository;
  vaccineRecommendationRepository: IVaccineRecommendationRepository;
  bookingRecommendationRepository: IBookingRecommendationRepository;
}

const RepositoryContext = createContext<Repositories | undefined>(undefined);

interface RepositoryProviderProps {
  children: ReactNode;
  useMocks?: boolean;
}

export const RepositoryProvider: React.FC<RepositoryProviderProps> = ({ children, useMocks = false }) => {
  const repositories: Repositories = useMocks
    ? {
        petRepository: new InMemoryPetRepository([]),
        tutorRepository: new InMemoryTutorRepository([]),
        serviceRepository: new InMemoryServiceRepository([]),
        bookingRepository: new InMemoryBookingRepository([]),
        vaccineRecommendationRepository: new InMemoryVaccineRecommendationRepository([]),
        bookingRecommendationRepository: new InMemoryBookingRecommendationRepository([]),
      }
    : {
        petRepository: new PetRepository(API_CONFIG.version),
        tutorRepository: new TutorRepository(API_CONFIG.version),
        serviceRepository: new ServiceRepository(API_CONFIG.version),
        bookingRepository: new BookingRepository(API_CONFIG.version),
        vaccineRecommendationRepository: new VaccineRecommendationRepository(API_CONFIG.version),
        bookingRecommendationRepository: new BookingRecommendationRepository(API_CONFIG.version),
      };

  return (
    <RepositoryContext.Provider value={repositories}>
      {children}
    </RepositoryContext.Provider>
  );
};

export const useRepositories = (): Repositories => {
  const context = useContext(RepositoryContext);
  if (context === undefined) {
    throw new Error('useRepositories must be used within a RepositoryProvider');
  }
  return context;
};
