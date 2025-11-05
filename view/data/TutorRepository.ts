import { BaseRepository } from './BaseRepository';
import { Tutor } from '../domain/entities';

export class TutorRepository extends BaseRepository<Tutor> {
  protected endpoint = 'tutor';
}
