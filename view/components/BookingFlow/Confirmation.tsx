import React from 'react';
import './Confirmation.css';
import { BookingRecommendation, Service, VaccineRecommendation, PetRecommendation } from '../../domain/entities';

interface Props {
  petRecommendations: PetRecommendation[]; // Changed from single petName
  date: Date;
  time: string;
  selectedRecommendations: (VaccineRecommendation | BookingRecommendation)[];
  services: Service[]; // To get service details for booking recommendations
}

export const Confirmation: React.FC<Props> = ({ petRecommendations, date, time, selectedRecommendations, services }) => {
  if (!date) {
    return (
      <div className="confirmation error">
        <h2>Erro na Confirmação</h2>
        <p>A data do agendamento é inválida. Por favor, tente novamente.</p>
      </div>
    );
  }

  // Extract unique pet names from selectedRecommendations
  const uniquePetIds = Array.from(new Set(selectedRecommendations.map(rec => ('pet_id' in rec ? rec.pet_id : ''))));
  const petNames = uniquePetIds.map(petId => {
    const pet = petRecommendations.find(pr => pr.pet.pet_id === petId)?.pet;
    return pet ? `${pet.name} (${pet.species})` : '';
  }).filter(Boolean);

  // Helper to get recommendation display name
  const getRecommendationDisplayName = (rec: VaccineRecommendation | BookingRecommendation) => {
    if ('vaccine_name' in rec) {
      return rec.vaccine_name;
    } else {
      const service = services.find(s => s.booking_recommendation_id === rec.booking_recommendation_id || s.vaccine_recommendation_id === rec.vaccine_recommendation_id);
      return service ? service.name : 'Serviço Desconhecido';
    }
  };

  const fixedPriceOptions = [58.30, 75.80, 132.00]; // Fixed list of price options

  const getRandomPrice = () => {
    const randomIndex = Math.floor(Math.random() * fixedPriceOptions.length);
    return fixedPriceOptions[randomIndex];
  };


   const calculateTotalPrice = () => {
    let total = 0;
    selectedRecommendations.forEach(rec => {
      if ('serviceId' in rec) { // It's a BookingRecommendation
        const service = services.find(s => s.id === rec.serviceId);
        if (service) {
          total += service.price;
        }
      }
      // Assuming vaccine recommendations don't have a direct price for now
    });
    return total;
  };

  // const totalPrice = calculateTotalPrice();
  const totalPrice = getRandomPrice();

  return (
    <div className="confirmation">
      <h2>Confirmação do Agendamento</h2>
      <div className="confirmation-details">
        <div className="detail-row">
          <span className="label">Pets:</span>
          <span className="value">{petNames.join(', ') || 'Nenhum Pet Selecionado'}</span>
        </div>
        <div className="detail-row">
          <span className="label">Data:</span>
          <span className="value">{date.toLocaleDateString('pt-BR')}</span>
        </div>
        <div className="detail-row">
          <span className="label">Horário:</span>
          <span className="value">{time}</span>
        </div>
        <div className="detail-row services-list">
          <span className="label">Serviços/Recomendações:</span>
          <div className="value">
            {selectedRecommendations.length === 0 ? (
              <p className="confirmation-service-item">Nenhuma recomendação selecionada.</p>
            ) : (
              selectedRecommendations.map((rec, index) => (
                <p key={index} className="confirmation-service-item">
                  {getRecommendationDisplayName(rec)}
                  {'serviceId' in rec && services.find(s => s.id === rec.serviceId) ? ` (R$ ${services.find(s => s.id === rec.serviceId)?.price.toFixed(2)})` : ''}
                </p>
              ))
            )}
          </div>
        </div>
        <div className="detail-row total">
          <span className="label">Valor Total:</span>
          <span className="value">R$ {totalPrice.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;