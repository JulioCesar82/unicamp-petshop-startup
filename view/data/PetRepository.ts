import { BaseRepository } from './BaseRepository';
import { Pet } from '../domain/entities';

export class PetRepository extends BaseRepository<Pet> {
  protected endpoint = 'pet';
  protected parentEndpoint = 'tutor';

  constructor(apiVersion: string = 'v1') {
    super(apiVersion);
  }
}