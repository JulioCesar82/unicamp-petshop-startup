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
    initialStep,
  } = useBooking({ onComplete: onClose, initialStep: 2 });

  let isNextButtonDisabled = false;
  if (currentStep === 2) {
    isNextButtonDisabled = !selectedService;
  } else if (currentStep === 3) {
    isNextButtonDisabled = !selectedDate || !selectedTime;
  }

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
              onSelect={setSelectedService}
              selectedService={selectedService}
            />
          )}

          {currentStep === 3 && (
            <DateSelection
              onSelect={(date, time) => {
                setSelectedDate(date);
                setSelectedTime(time);
              }}
              onConfirm={next}
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
            disabled={isNextButtonDisabled}
          >
            {currentStep === steps.length ? 'Confirmar Agendamento' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  );
};