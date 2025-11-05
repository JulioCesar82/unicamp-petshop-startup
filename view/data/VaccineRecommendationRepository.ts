import { BaseRepository } from './BaseRepository';
import { VaccineRecommendation } from '../domain/entities';

export class VaccineRecommendationRepository extends BaseRepository<VaccineRecommendation> {
  protected endpoint = 'vaccine-recommendations';
  protected parentEndpoint = 'tutor';

  constructor(apiVersion: string = 'v1') {
    super(apiVersion);
  }
}