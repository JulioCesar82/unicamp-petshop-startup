import { Auditable } from './interfaces';

export interface Pet extends Auditable {
  id: string | number;
  name: string;
  species: string;
  breed: string;
  birthDate: string; // Changed to string for simplicity with API
  size: 'small' | 'medium' | 'large';
  furType: 'short' | 'medium' | 'long'; // Corrected furType options
  photo?: string; // Changed to string (URL or base64) for simplicity with API
  tutorId: string | number;
}

export interface Tutor extends Auditable {
  id: string | number;
  name: string;
  email: string;
  phone: string;
}

export interface Service extends Auditable {
  id: string | number;
  name: string;
  description: string;
  price: number;
  duration: string; // e.g., "30min", "1h"
}

export interface Booking extends Auditable {
  id: string | number;
  petId: string | number;
  serviceId: string | number;
  date: string; // ISO date string
  time: string; // e.g., "10:00"
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

export interface VaccineRecommendation {
  id: string | number;
  petId: string | number;
  vaccineName: string;
  recommendedDate: string;
  status: string;
  reason: string;
}

export interface BookingRecommendation {
  id: string | number;
  petId: string | number;
  serviceId: string | number;
  recommendedDate: string;
  reason: string;
}

export interface PetRecommendation {
  pet: {
    id: string | number;
    name: string;
    species: string;
    breed: string;
  };
  vaccineRecommendations: VaccineRecommendation[];
  bookingRecommendations: BookingRecommendation[];
}