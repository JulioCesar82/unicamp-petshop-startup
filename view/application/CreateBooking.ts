import { Booking } from '../domain/entities';
import { IBookingRepository } from '../domain/repositories';

export class CreateBooking {
  constructor(private bookingRepository: IBookingRepository) {}

  async execute(booking: Booking): Promise<void> {
    // Here you could add validation logic before creating the booking
    return this.bookingRepository.createBooking(booking);
  }
}
