import { Booking, Service } from './entities';

export interface IServiceRepository {
  getServices(): Promise<Service[]>;
}

export interface IBookingRepository {
  createBooking(booking: Booking): Promise<void>;
}

export interface IAvailabilityRepository {
  getAvailableSlots(date: Date, durationInMinutes: number): Promise<string[]>;
}
