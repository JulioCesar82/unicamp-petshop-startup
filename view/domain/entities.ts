export interface Pet {
  id?: string;
  name: string;
  species: string;
  breed: string;
  birthDate: Date;
  size: 'small' | 'medium' | 'large';
  furType: 'small' | 'medium' | 'large';
  photo?: File;
  tutorId?: string;
}

export interface Tutor {
  id?: string;
  name: string;
  email: string;
  phone: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
}

export interface Booking {
  pet: Pet;
  service: Service;
  date: Date;
  time: string;
}
