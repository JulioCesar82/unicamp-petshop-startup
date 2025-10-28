import React from 'react';
import { BookingFlow } from '../BookingFlow';
import './styles.css';

interface BookingReminderProps {
  onClose: () => void;
  onSchedule: () => void;
}

export const BookingReminder: React.FC<BookingReminderProps> = ({
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
              <i className="fas fa-dog"></i>
            </div>
            <div className="reminder-text">
              <h3>Olá Marcelo, temos uma sugestão para você!</h3>
              <p>O Max (Golden) está próximo da data ideal para um Banho e Tosa!</p>
              <p>Sugerimos agendar entre 13/04 e 27/05.</p>
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