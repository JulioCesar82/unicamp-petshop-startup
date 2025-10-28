import { Booking } from '../domain/entities';
import { IBookingRepository } from '../domain/repositories';

export class BookingRepository implements IBookingRepository {
  async createBooking(booking: Booking): Promise<void> {
    // In a real application, this would send data to an API
    console.log('Creating booking:', booking);
    return Promise.resolve();
  }
}
