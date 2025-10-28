import React, { useEffect, useState } from 'react';
import './styles.css';
import { useBooking } from './useBooking';
import { StepIndicator } from './StepIndicator';
import { PetRegistration } from './PetRegistration';
import { ServiceSelection } from './ServiceSelection';
import { DateSelection } from './DateSelection';
import { Confirmation } from './Confirmation';
import { BookingRepository } from '../../data/BookingRepository';
import { ServiceRepository } from '../../data/ServiceRepository';
import { AvailabilityRepository } from '../../data/AvailabilityRepository';
import { CreateBooking } from '../../application/CreateBooking';
import { GetServices } from '../../application/GetServices';
import { GetAvailableSlots } from '../../application/GetAvailableSlots';
import { Pet, Service } from '../../domain/entities';

interface BookingFlowProps {
  onClose: () => void;
  initialPet?: Pet;
}

const bookingRepository = new BookingRepository();
const serviceRepository = new ServiceRepository();
const availabilityRepository = new AvailabilityRepository();
const createBookingUseCase = new CreateBooking(bookingRepository);
const getServicesUseCase = new GetServices(serviceRepository);
const getAvailableSlotsUseCase = new GetAvailableSlots(availabilityRepository);

// Helper function to parse duration string to minutes
function parseDurationToMinutes(duration: string): number {
  if (!duration) return 60;
  if (duration.includes('h')) {
    const parts = duration.split('h');
    const hours = parseInt(parts[0], 10) || 0;
    const mins = parts[1] ? parseInt(parts[1].replace('m', ''), 10) || 0 : 0;
    return hours * 60 + mins;
  }
  if (duration.includes('m')) {
    return parseInt(duration.replace('m', ''), 10) || 60;
  }
  return 60;
}

export const BookingFlow: React.FC<BookingFlowProps> = ({ onClose, initialPet }) => {
  const initialStep = true/*initialPet?.breed === ''*/ ? 2 : 1;

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
  } = useBooking(createBookingUseCase, { onComplete: onClose, initialStep });

  const [services, setServices] = useState<Service[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  useEffect(() => {
    getServicesUseCase.execute().then(setServices);
  }, []);

  useEffect(() => {
    if (currentStep === 3 && !selectedDate) {
      setSelectedDate(new Date());
    }
  }, [currentStep, selectedDate, setSelectedDate]);

  useEffect(() => {
    console.log('Selected Date or Service changed:', selectedDate, selectedService);
    if (selectedDate && selectedService) {
      const durationInMinutes = parseDurationToMinutes(selectedService.duration);
      console.log('Fetching available slots for date:', selectedDate, 'with duration:', durationInMinutes);

      getAvailableSlotsUseCase.execute(selectedDate, durationInMinutes)
        .then(setAvailableSlots);
    }
  }, [selectedDate, selectedService]);

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
              services={services}
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
              availableSlots={availableSlots}
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
