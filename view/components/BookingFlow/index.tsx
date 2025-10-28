import React from 'react';
import './styles.css';
import { useBooking } from './useBooking';
import { StepIndicator } from './StepIndicator';
import { PetRegistration } from './PetRegistration';
import { ServiceSelection } from './ServiceSelection';
import { DateSelection } from './DateSelection';
import { Confirmation } from './Confirmation';

interface BookingFlowProps {
  onClose: () => void;
}

export const BookingFlow: React.FC<BookingFlowProps> = ({ onClose }) => {
  const {
    currentStep,
    steps,
    petData,
    selectedService,
    selectedDate,
    selectedTime,
    next,
    back,
    complete,
    setPetData,
    setSelectedService,
    setSelectedDate,
    setSelectedTime,
  } = useBooking({ onComplete: onClose });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="booking-flow-modal" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>

        <div className="booking-flow-header">
          <StepIndicator currentStep={currentStep} labels={steps} />
        </div>

        <div className="booking-flow-content">
          {currentStep === 1 && (
            <PetRegistration
              onSubmit={(data) => {
                setPetData(data);
                next();
              }}
            />
          )}

          {currentStep === 2 && (
            <ServiceSelection
              onSelect={(service) => {
                setSelectedService(service);
                next();
              }}
              selectedService={selectedService}
            />
          )}

          {currentStep === 3 && (
            <DateSelection
              onSelect={(date, time) => {
                setSelectedDate(date);
                setSelectedTime(time);
                next();
              }}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedService={selectedService}
            />
          )}

          {currentStep === 4 && (
            <Confirmation
              petName={petData?.name || ''}
              serviceName={selectedService?.name || ''}
              date={selectedDate!}
              time={selectedTime!}
              price={selectedService?.price || 0}
            />
          )}
        </div>

        <div className="booking-flow-footer">
          {currentStep > 1 && (
            <button className="secondary-button" onClick={back}>
              Voltar
            </button>
          )}

          <button
            className="primary-button"
            onClick={currentStep === steps.length ? complete : next}
          >
            {currentStep === steps.length ? 'Confirmar Agendamento' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  );
};