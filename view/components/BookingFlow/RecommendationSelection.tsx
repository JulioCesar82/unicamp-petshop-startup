import React from 'react';
import { PetRecommendation, VaccineRecommendation, BookingRecommendation } from '../../domain/entities';
import { useUser } from '../../contexts/UserContext';
import { useRepositories } from '../../contexts/RepositoryContext';

interface RecommendationSelectionProps {
  petRecommendations: PetRecommendation[];
  selectedPetId?: string | number | null;
  selectedRecommendations: (VaccineRecommendation | BookingRecommendation)[];
  onSelectRecommendations: (recs: (VaccineRecommendation | BookingRecommendation)[]) => void;
}

export const RecommendationSelection: React.FC<RecommendationSelectionProps> = ({
  petRecommendations,
  selectedPetId,
  selectedRecommendations,
  onSelectRecommendations,
}) => {
  const { pets } = useUser();
  const { serviceRepository } = useRepositories();
  const [services, setServices] = React.useState<Record<string | number, string>>({});

  React.useEffect(() => {
    const fetchServiceNames = async () => {
      const serviceMap: Record<string | number, string> = {};
      const allServiceIds = new Set<string | number>();

      petRecommendations.forEach(petRec => {
        petRec.bookingRecommendations.forEach(rec => allServiceIds.add(rec.serviceId));
      });

      for (const serviceId of Array.from(allServiceIds)) {
        const service = await serviceRepository.findById(serviceId);
        if (service) {
          serviceMap[service.id] = service.name;
        }
      }
      setServices(serviceMap);
    };
    fetchServiceNames();
  }, [petRecommendations, serviceRepository]);

  const currentPetRecs = petRecommendations.find(pr => pr.pet.id === selectedPetId);
  const pet = pets.find(p => p.id === selectedPetId);

  if (!currentPetRecs || !pet) {
    return <p>Selecione um pet para ver as recomendações.</p>;
  }

  const allRecsForPet = [
    ...currentPetRecs.vaccineRecommendations.map(rec => ({ ...rec, type: 'vaccine' as const })),
    ...currentPetRecs.bookingRecommendations.map(rec => ({ ...rec, type: 'booking' as const, serviceName: services[rec.serviceId] })),
  ];

  const handleToggleRecommendation = (rec: VaccineRecommendation | BookingRecommendation) => {
    onSelectRecommendations(prev => {
      if (prev.some(r => r.id === rec.id)) {
        return prev.filter(r => r.id !== rec.id);
      } else {
        return [...prev, rec];
      }
    });
  };

  const getRecommendationTitle = (rec: VaccineRecommendation | BookingRecommendation, type: 'vaccine' | 'booking') => {
    if (type === 'vaccine') {
      return (rec as VaccineRecommendation).vaccineName;
    } else {
      return services[(rec as BookingRecommendation).serviceId] || 'Serviço Desconhecido';
    }
  };

  return (
    <div className="recommendation-selection">
      <h3>Recomendações para {pet.name}</h3>
      <div className="recommendation-list">
        {allRecsForPet.map((rec) => (
          <div
            key={rec.id}
            className={`recommendation-item ${selectedRecommendations.some(r => r.id === rec.id) ? 'selected' : ''}`}
            onClick={() => handleToggleRecommendation(rec)}
          >
            <input
              type="checkbox"
              checked={selectedRecommendations.some(r => r.id === rec.id)}
              onChange={() => handleToggleRecommendation(rec)}
            />
            <span>{getRecommendationTitle(rec, rec.type)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};