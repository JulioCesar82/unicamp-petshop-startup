import { BookingRepository } from '../data/BookingRepository';
import { Booking, Pet, Service } from '../domain/entities';

interface CreateBookingParams {
  pet: Pet;
  service: Service;
  date: Date;
  time: string;
}

export class CreateBooking {
  constructor(private bookingRepository: BookingRepository) {}

  async execute(params: CreateBookingParams): Promise<Booking> {
    const newBooking: Partial<Booking> = {
      petId: params.pet.id,
      serviceId: params.service.id,
      date: params.date.toISOString().split('T')[0],
      time: params.time,
      status: 'pending',
    };
    return this.bookingRepository.create(newBooking);
  }
}