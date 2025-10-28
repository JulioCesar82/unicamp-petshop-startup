export interface PetRegistrationData {
  name: string;
  species: 'dog' | 'cat';
  breed: string;
  size: 'small' | 'medium' | 'large';
  furType: 'small' | 'medium' | 'large';
  birthDate: Date;
  photo?: File;
}

export type Service = {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: string; // e.g. '1h', '1h30', '2h'
};

export interface UseBookingOptions {
  onComplete?: () => void;
}
