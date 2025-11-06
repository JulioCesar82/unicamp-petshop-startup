import React from 'react';

import { BookingFlow } from '../BookingFlow';
import { useRecommendations } from '../../contexts/RecommendationContext';
import { useUser } from '../../contexts/UserContext';
import { VaccineRecommendation, BookingRecommendation } from '../../domain/entities';

import './styles.css';

interface BookingReminderProps {
  onClose: () => void;
  onSchedule: () => void;
}

export const BookingReminder: React.FC<BookingReminderProps> = ({
  onClose,
  onSchedule,
}) => {
  const { petRecommendations, loadingRecommendations, dismissRecommendation, snoozeRecommendation } = useRecommendations();
  const { pets } = useUser();

  if (loadingRecommendations) {
    return null; // Or a loading spinner
  }

  if (petRecommendations.length === 0) {
    return null; // No recommendations to show
  }

  const getPetPhoto = (petId: string | number) => {
    const pet = pets.find(p => p.id === petId);
    return pet?.image_path || '/public/icon-pet.png'; // Default icon if no photo
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

  const handleDismiss = (rec: VaccineRecommendation | BookingRecommendation, type: 'vaccine' | 'booking') => {
    dismissRecommendation(rec, type);
    onClose();
  };

  const handleSnooze = (rec: VaccineRecommendation | BookingRecommendation, type: 'vaccine' | 'booking') => {
    snoozeRecommendation(rec, type);
    onClose();
  };

  const handleSchedule = () => {
    onSchedule();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        
        <div className="reminder-content">
          <div className="reminder-main-content">
            <div className="reminder-text">
              <h3>Olá! Temos recomendações para você</h3>
              {petRecommendations.map((petRec, petIndex) => (
                <div key={petRec.pet.id ? petRec.pet.id : `pet-idx-${petIndex}`} className="pet-recommendation">
                  <div className="pet-header">
                    <img src={getPetPhoto(petRec.pet.id)} alt={petRec.pet.name} className="pet-photo" />
                    <h4>{petRec.pet.name} ({petRec.pet.animal_type})</h4>
                  </div>
                  {
                    petRec.vaccineRecommendations.map((rec, index) => (
                      <div key={rec.id ? `vaccine-${rec.id}` : `vaccine-idx-${index}`} className="recommendation-item">
                        {getRecommendationIcon('vaccine')}
                        <strong className='recommendation-item-name'>{rec.vaccine_name}</strong>
                        <br />
                        <small>Data recomendada: {new Date(rec.suggested_date).toLocaleDateString('pt-BR')}</small>
                        <br />
                        <small>{rec.reason}</small>
                        <div className="recommendation-actions">
                          <button className="light-button" onClick={() => handleDismiss(rec, 'vaccine')}>Dispensar</button>
                          <button className="secondary-button" onClick={() => handleSnooze(rec, 'vaccine')}>Lembrar mais tarde</button>
                        </div>
                      </div>
                    ))
                  }
                  {
                    petRec.bookingRecommendations.map((rec, index) => (
                      <div key={rec.id ? `booking-${rec.id}` : `booking-idx-${index}`} className="recommendation-item">
                        {getRecommendationIcon('booking', (rec as any).serviceName)}
                        <strong className='recommendation-item-name'>Banho e Tosa</strong>
                        <br />
                        <small>Data recomendada: {new Date(rec.suggested_date).toLocaleDateString('pt-BR')}</small>
                        <br />
                        <small>{rec.reason}</small>
                        <div className="recommendation-actions">
                          <button className="light-button" onClick={() => handleDismiss(rec, 'booking')}>Dispensar</button>
                          <button className="secondary-button" onClick={() => handleSnooze(rec, 'booking')}>Lembrar mais tarde</button>
                        </div>
                      </div>
                    ))
                  }
                </div>
              ))}
            </div>
          </div>
          <div className="reminder-actions">
            <button 
              className="primary-button"
              onClick={handleSchedule}
            >
              QUERO AGENDAR!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};