import React from 'react';
import { PetRecommendation, VaccineRecommendation, BookingRecommendation, Pet } from '../../domain/entities';
import { useRepositories } from '../../contexts/RepositoryContext';
interface RecommendationSelectionProps {
  petRecommendations: PetRecommendation[];
  selectedRecommendations: (VaccineRecommendation | BookingRecommendation)[];
  onSelectRecommendations: (recs: (VaccineRecommendation | BookingRecommendation)[]) => void;
  setCurrentStep: (step: number) => void;
}

const getPetPhoto = (pet: Pet) => {
  return pet?.image_path || 'icon-pet.png'; // Default icon if no photo
};

const getRecommendationIcon = (type: 'vaccine' | 'booking', serviceName?: string) => {
  if (type === 'vaccine') {
    return <i className="fas fa-syringe"></i>; // Syringe icon for vaccines
  } else if (type === 'booking') {
    // Customize icons based on serviceName if needed
    if (serviceName?.toLowerCase().includes('banho')) return <i className="fas fa-bath"></i>;
    if (serviceName?.toLowerCase().includes('tosa')) return <i className="fas fa-cut"></i>;
    if (serviceName?.toLowerCase().includes('consulta')) return <i className="fas fa-stethoscope"></i>;
    return <i className="fas fa-paw"></i>; // Default paw icon for other bookings
  }
  return null;
};

const getRecommendationUniqueKey = (petId: string | number, type: 'vaccine' | 'booking', recId: string | number) => {
  return `${petId}-${type}-${recId}`;
};

export const RecommendationSelection: React.FC<RecommendationSelectionProps> = ({
  petRecommendations,
  selectedRecommendations,
  onSelectRecommendations,
  setCurrentStep,
}) => {
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
    // fetchServiceNames();
  }, [petRecommendations, serviceRepository]);

  const handleToggleRecommendation = (petId: string | number, type: 'vaccine' | 'booking', identification: number, rec: VaccineRecommendation | BookingRecommendation) => {
    const uniqueKey = getRecommendationUniqueKey(petId, type, identification);
    const isSelected = selectedRecommendations.some(
      (selectedRec) => getRecommendationUniqueKey(selectedRec.pet_id, selectedRec.vaccine_recommendation_id ? 'vaccine' : 'booking', selectedRec.vaccine_recommendation_id || selectedRec.booking_recommendation_id
      ) === uniqueKey
    );

    let newSelection;
    if (isSelected) {
      newSelection = selectedRecommendations.filter(
        (selectedRec) => getRecommendationUniqueKey(selectedRec.pet_id, selectedRec.vaccine_recommendation_id ? 'vaccine' : 'booking', selectedRec.vaccine_recommendation_id || selectedRec.booking_recommendation_id
        ) !== uniqueKey
      );
    } else {
      newSelection = [...selectedRecommendations, rec];
    }
    onSelectRecommendations(newSelection);
  };

  return (
    <div className="recommendation-selection">
      <h3>Selecione as recomendações para agendar</h3>
      <div className="recommendation-list">
        {petRecommendations.map((petRec, petIndex) => (
          <div key={petRec.pet.id ? petRec.pet.id : `pet-idx-${petIndex}`} className="pet-recommendation">
            <div className="pet-header">
              <img src={getPetPhoto(petRec.pet)} alt={petRec.pet.name} className="pet-photo" />
              <h4>{petRec.pet.name} ({petRec.pet.animal_type})</h4>
            </div>
            {
              petRec.vaccineRecommendations.map((rec, index) => (
                <div
                  key={getRecommendationUniqueKey(rec.pet_id, 'vaccine', rec.vaccine_recommendation_id || `idx-${index}`)}
                  className={`recommendation-item ${selectedRecommendations.some(
                    (selectedRec) => getRecommendationUniqueKey(selectedRec.pet_id, 'vaccine', selectedRec.vaccine_recommendation_id
                    ) === getRecommendationUniqueKey(rec.pet_id, 'vaccine', rec.vaccine_recommendation_id)
                  ) ? 'selected' : ''}`
                  }
                >
                  <input
                    type="checkbox"
                    checked={selectedRecommendations.some(
                      (selectedRec) => getRecommendationUniqueKey(selectedRec.pet_id, 'vaccine', selectedRec.vaccine_recommendation_id
                      ) === getRecommendationUniqueKey(rec.pet_id, 'vaccine', rec.vaccine_recommendation_id)
                    )}
                    onChange={() => handleToggleRecommendation(petRec.pet.pet_id, 'vaccine', rec.vaccine_recommendation_id, rec)}
                  />
                  {getRecommendationIcon('vaccine')}
                  <strong className='recommendation-item-name'>{rec.vaccine_name}</strong>
                  <br />
                  <small>Data recomendada: {new Date(rec.suggested_date).toLocaleDateString('pt-BR')}</small>
                  <br />
                  <small>{rec.reason}</small>
                </div>
              ))
            }
            {
              petRec.bookingRecommendations.map((rec, index) => (
                <div
                  key={getRecommendationUniqueKey(rec.pet_id, 'booking', rec.booking_recommendation_id || `idx-${index}`)}
                  className={`recommendation-item ${selectedRecommendations.some(
                    (selectedRec) => getRecommendationUniqueKey(selectedRec.pet_id, 'booking', selectedRec.booking_recommendation_id
                    ) === getRecommendationUniqueKey(rec.pet_id, 'booking', rec.booking_recommendation_id)
                  ) ? 'selected' : ''}`
                  }
                >
                  <input
                    type="checkbox"
                    checked={selectedRecommendations.some(
                      (selectedRec) => getRecommendationUniqueKey(selectedRec.pet_id, 'booking', selectedRec.booking_recommendation_id
                      ) === getRecommendationUniqueKey(rec.pet_id, 'booking', rec.booking_recommendation_id)
                    )}
                    onChange={() => handleToggleRecommendation(petRec.pet.pet_id, 'booking', rec.booking_recommendation_id, rec)}
                  />
                  {getRecommendationIcon('booking', services[rec.serviceId])}
                  <strong className='recommendation-item-name'>{services[rec.serviceId] || 'Serviço Desconhecido'}</strong>
                  <br />
                  <small>Data recomendada: {new Date(rec.suggested_date).toLocaleDateString('pt-BR')}</small>
                  <br />
                  <small>{rec.reason}</small>
                </div>
              ))
            }
          </div>
        ))}
      </div>
    </div>
  );
};