import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { RecommendationProvider, useRecommendations } from './RecommendationContext';
import { RepositoryProvider } from './RepositoryContext';
import { UserProvider } from './UserContext';
import { API_CONFIG } from '../config';
import { Pet, VaccineRecommendation, BookingRecommendation, Tutor } from '../domain/entities';

// Mock repositories
const mockVaccineRecommendationRepository = {
  findAll: vi.fn(),
};
const mockBookingRecommendationRepository = {
  findAll: vi.fn(),
};
const mockPetRepository = {
  findAll: vi.fn(),
};
const mockTutorRepository = {
  findById: vi.fn(),
};

// Mock useUser hook
vi.mock('./UserContext', () => ({
  useUser: vi.fn(),
}));

// Mock useRepositories hook
vi.mock('./RepositoryContext', () => ({
  useRepositories: vi.fn(() => ({
    vaccineRecommendationRepository: mockVaccineRecommendationRepository,
    bookingRecommendationRepository: mockBookingRecommendationRepository,
    petRepository: mockPetRepository,
    tutorRepository: mockTutorRepository,
  })),
  RepositoryProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const mockTutor: Tutor = {
  id: '1',
  name: 'Test Tutor',
  email: 'test@example.com',
  phone: '123456789',
  dcreated: '',
  dlastupdate: '',
  nenabled: true,
};

const mockPets: Pet[] = [
  {
    id: 'pet1',
    name: 'Buddy',
    species: 'Dog',
    breed: 'Golden Retriever',
    birthDate: '2020-01-01',
    size: 'medium',
    furType: 'long',
    tutorId: '1',
    dcreated: '',
    dlastupdate: '',
    nenabled: true,
  },
  {
    id: 'pet2',
    name: 'Whiskers',
    species: 'Cat',
    breed: 'Siamese',
    birthDate: '2021-05-10',
    size: 'small',
    furType: 'short',
    tutorId: '1',
    dcreated: '',
    dlastupdate: '',
    nenabled: true,
  },
];

const mockVaccineRecs: VaccineRecommendation[] = [
  {
    id: 'vrec1',
    petId: 'pet1',
    vaccineName: 'Rabies',
    recommendedDate: '2024-12-01',
    status: 'pending',
    reason: 'Annual shot',
  },
  {
    id: 'vrec2',
    petId: 'pet2',
    vaccineName: 'FVRCP',
    recommendedDate: '2024-11-15',
    status: 'pending',
    reason: 'Booster',
  },
];

const mockBookingRecs: BookingRecommendation[] = [
  {
    id: 'brec1',
    petId: 'pet1',
    serviceId: 'service1',
    recommendedDate: '2024-12-10',
    reason: 'Grooming needed',
  },
];

describe('RecommendationContext', () => {
  beforeEach(() => {
    vi.mocked(mockTutorRepository.findById).mockResolvedValue(mockTutor);
    vi.mocked(mockPetRepository.findAll).mockResolvedValue({ data: mockPets, pagination: { page: 1, pageSize: 10, total: mockPets.length } });
    vi.mocked(mockVaccineRecommendationRepository.findAll).mockResolvedValue({ data: mockVaccineRecs, pagination: { page: 1, pageSize: 10, total: mockVaccineRecs.length } });
    vi.mocked(mockBookingRecommendationRepository.findAll).mockResolvedValue({ data: mockBookingRecs, pagination: { page: 1, pageSize: 10, total: mockBookingRecs.length } });

    // Mock useUser to return the mock tutor and pets
    vi.mocked(useUser).mockReturnValue({
      tutor: mockTutor,
      pets: mockPets,
      loading: false,
    });

    // Clear sessionStorage before each test
    sessionStorage.clear();
  });

  it('should fetch and provide pet recommendations', async () => {
    const { result } = renderHook(() => useRecommendations(), {
      wrapper: ({ children }) => (
        <UserProvider>
          <RepositoryProvider>{children}</RepositoryProvider>
        </UserProvider>
      ),
    });

    await waitFor(() => expect(result.current.loadingRecommendations).toBe(false));

    expect(result.current.petRecommendations).toHaveLength(2);
    expect(result.current.petRecommendations[0].pet.id).toBe('pet1');
    expect(result.current.petRecommendations[0].vaccineRecommendations).toHaveLength(1);
    expect(result.current.petRecommendations[0].bookingRecommendations).toHaveLength(1);
    expect(result.current.petRecommendations[1].pet.id).toBe('pet2');
    expect(result.current.petRecommendations[1].vaccineRecommendations).toHaveLength(1);
    expect(result.current.petRecommendations[1].bookingRecommendations).toHaveLength(0);
  });

  it('should dismiss a recommendation', async () => {
    const { result } = renderHook(() => useRecommendations(), {
      wrapper: ({ children }) => (
        <UserProvider>
          <RepositoryProvider>{children}</RepositoryProvider>
        </UserProvider>
      ),
    });

    await waitFor(() => expect(result.current.loadingRecommendations).toBe(false));

    act(() => {
      result.current.dismissRecommendation(mockVaccineRecs[0], 'vaccine');
    });

    await waitFor(() => {
      const pet1Recs = result.current.petRecommendations.find(pr => pr.pet.id === 'pet1');
      expect(pet1Recs?.vaccineRecommendations).toHaveLength(0);
    });

    // Verify sessionStorage
    expect(sessionStorage.getItem('dismissedRecommendations')).toContain('"id":"vrec1","type":"vaccine"}');
  });

  it('should snooze a recommendation', async () => {
    const { result } = renderHook(() => useRecommendations(), {
      wrapper: ({ children }) => (
        <UserProvider>
          <RepositoryProvider>{children}</RepositoryProvider>
        </UserProvider>
      ),
    });

    await waitFor(() => expect(result.current.loadingRecommendations).toBe(false));

    act(() => {
      result.current.snoozeRecommendation(mockBookingRecs[0], 'booking');
    });

    await waitFor(() => {
      const pet1Recs = result.current.petRecommendations.find(pr => pr.pet.id === 'pet1');
      expect(pet1Recs?.bookingRecommendations).toHaveLength(0);
    });

    // Verify sessionStorage
    const snoozedItems = JSON.parse(sessionStorage.getItem('snoozedRecommendations') || '[]');
    expect(snoozedItems[0].id).toBe('brec1');
    expect(snoozedItems[0].type).toBe('booking');
    expect(snoozedItems[0].snoozeUntil).toBeGreaterThan(Date.now());
  });

  it('should not show snoozed recommendations until after snooze period', async () => {
    // Pre-snooze a recommendation
    const futureDate = Date.now() + 1000 * 60 * 60 * 24 * 2; // 2 days from now
    sessionStorage.setItem('snoozedRecommendations', JSON.stringify([{ id: 'vrec1', type: 'vaccine', snoozeUntil: futureDate }]));

    const { result } = renderHook(() => useRecommendations(), {
      wrapper: ({ children }) => (
        <UserProvider>
          <RepositoryProvider>{children}</RepositoryProvider>
        </UserProvider>
      ),
    });

    await waitFor(() => expect(result.current.loadingRecommendations).toBe(false));

    const pet1Recs = result.current.petRecommendations.find(pr => pr.pet.id === 'pet1');
    expect(pet1Recs?.vaccineRecommendations).toHaveLength(0); // Should be snoozed
  });

  it('should show snoozed recommendations after snooze period expires', async () => {
    // Pre-snooze a recommendation that has already expired
    const pastDate = Date.now() - 1000 * 60 * 60 * 24 * 2; // 2 days ago
    sessionStorage.setItem('snoozedRecommendations', JSON.stringify([{ id: 'vrec1', type: 'vaccine', snoozeUntil: pastDate }]));

    const { result } = renderHook(() => useRecommendations(), {
      wrapper: ({ children }) => (
        <UserProvider>
          <RepositoryProvider>{children}</RepositoryProvider>
        </UserProvider>
      ),
    });

    await waitFor(() => expect(result.current.loadingRecommendations).toBe(false));

    const pet1Recs = result.current.petRecommendations.find(pr => pr.pet.id === 'pet1');
    expect(pet1Recs?.vaccineRecommendations).toHaveLength(1); // Should be visible again
  });
});
