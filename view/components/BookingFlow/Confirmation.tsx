import React from 'react';
import './Confirmation.css';
import { BookingRecommendation, Service, VaccineRecommendation } from '../../domain/entities';

interface Props {
  petName: string;
  date: Date;
  time: string;
  selectedRecommendations: (VaccineRecommendation | BookingRecommendation)[];
  services: Service[]; // To get service details for booking recommendations
}

export const Confirmation: React.FC<Props> = ({ petName, date, time, selectedRecommendations, services }) => {
  if (!date) {
    return (
      <div className="confirmation error">
        <h2>Erro na Confirmação</h2>
        <p>A data do agendamento é inválida. Por favor, tente novamente.</p>
      </div>
    );
  }

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

  const totalPrice = calculateTotalPrice();

  return (
    <div className="confirmation">
      <h2>Confirmação do Agendamento</h2>
      <div className="confirmation-details">
        <div className="detail-row">
          <span className="label">Pet:</span>
          <span className="value">{petName}</span>
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
            {selectedRecommendations.map((rec, index) => (
              <p key={index} className="confirmation-service-item">
                {'vaccineName' in rec ? rec.vaccineName : services.find(s => s.id === rec.serviceId)?.name || 'Serviço'}
                {'serviceId' in rec && services.find(s => s.id === rec.serviceId) ? ` (R$ ${services.find(s => s.id === rec.serviceId)?.price.toFixed(2)})` : ''}
              </p>
            ))}
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