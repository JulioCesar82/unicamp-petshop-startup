import { BaseRepository } from './BaseRepository';
import { Booking } from '../domain/entities';

export class BookingRepository extends BaseRepository<Booking> {
  protected endpoint = 'booking';
}