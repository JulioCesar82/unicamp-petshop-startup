import React from 'react';
import { BookingFlow } from '../BookingFlow';
import { PetRecommendation } from '../../domain/entities';
import './styles.css';

interface BookingReminderProps {
  recommendations: PetRecommendation[];
  onClose: () => void;
  onSchedule: () => void;
}

export const BookingReminder: React.FC<BookingReminderProps> = ({
  recommendations,
  onClose,
  onSchedule
}) => {
  const [showBookingFlow, setShowBookingFlow] = React.useState(false);

  if (showBookingFlow) {
    return (
      <BookingFlow 
        onClose={() => {
          setShowBookingFlow(false);
          onClose();
        }}
      />
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        
        <div className="reminder-content">
          <div className="reminder-main-content">
            <div className="pet-icon">
              <i className="fas fa-syringe"></i>
            </div>
            <div className="reminder-text">
              <h3>Olá! Temos recomendações de vacinas para seus pets:</h3>
              {recommendations.map((petRec, index) => (
                <div key={index} className="pet-recommendation">
                  <h4>{petRec.pet.name} ({petRec.pet.breed})</h4>
                  {petRec.recommendations.map((vaccine, vIndex) => (
                    <p key={vIndex}>
                      <strong>{vaccine.vaccineName}</strong> - {vaccine.status}
                      <br />
                      <small>Data recomendada: {new Date(vaccine.recommendedDate).toLocaleDateString('pt-BR')}</small>
                      <br />
                      <small>{vaccine.reason}</small>
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="reminder-actions">
            <button 
              className="primary-button"
              onClick={() => {
                setShowBookingFlow(true);
                onSchedule();
              }}
            >
              QUERO AGENDAR!
            </button>
            <button 
              className="secondary-button"
              onClick={onClose}
            >
              Lembrar mais tarde
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
