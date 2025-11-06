import React, { useEffect, useState } from 'react';
import { useBooking } from './useBooking';
import { StepIndicator } from './StepIndicator';
import { PetSelection } from './PetSelection';
import { PetRegistration } from './PetRegistration'; // Import PetRegistration
import { PetManagement } from './PetManagement'; // Import PetManagement
import { RecommendationSelection } from './RecommendationSelection'; // New component
import { DateSelection } from './DateSelection';
import { Confirmation } from './Confirmation';

import { CreateBooking } from '../../application/CreateBooking';
import { GetServices } from '../../application/GetServices';
import { GetAvailableSlots } from '../../application/GetAvailableSlots';
import { Pet, Service, PetRecommendation, VaccineRecommendation, BookingRecommendation } from '../../domain/entities';
import { useRepositories } from '../../contexts/RepositoryContext';
import { useRecommendations } from '../../contexts/RecommendationContext';

import './styles.css';

interface BookingFlowProps {
  onClose: () => void;
  petRecommendations: PetRecommendation[];
  // Optional prop to enable mocking for GetAvailableSlots
  mockGetAvailableSlots?: boolean;
}

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

export const BookingFlow: React.FC<BookingFlowProps> = ({ onClose, petRecommendations, mockGetAvailableSlots }) => {
  const { bookingRepository, serviceRepository, availabilityRepository } = useRepositories();
  const { dismissRecommendation, snoozeRecommendation } = useRecommendations();

  const createBookingUseCase = React.useMemo(() => new CreateBooking(bookingRepository), [bookingRepository]);
  const getServicesUseCase = React.useMemo(() => new GetServices(serviceRepository), [serviceRepository]);

  const {
    currentStep,
    steps,
    petData,
    selectedService,
    selectedDate,
    selectedTime,
    selectedRecommendations,
    next,
    back,
    complete,
    setPetData,
    setSelectedService,
    setSelectedDate,
    setSelectedTime,
    setSelectedRecommendations,
    setCurrentStep,
  } = useBooking(createBookingUseCase, { onComplete: onClose, initialStep: 2 });

  const [services, setServices] = useState<Service[]>([]);

  useEffect(() => {
    getServicesUseCase.execute().then(setServices);
  }, [getServicesUseCase]);

  useEffect(() => {
    if (currentStep === 3 && !selectedDate) {
      setSelectedDate(new Date());
    }
  }, [currentStep, selectedDate, setSelectedDate]);

  const handleCompleteBooking = async () => {
    await complete();
    // Mark selected recommendations as dismissed
    selectedRecommendations.forEach(rec => {
      if ('vaccineName' in rec) {
        dismissRecommendation(rec as VaccineRecommendation, 'vaccine');
      } else {
        dismissRecommendation(rec as BookingRecommendation, 'booking');
      }
    });
    // Mark unselected recommendations as snoozed
    petRecommendations.forEach(petRec => {
      petRec.vaccineRecommendations.forEach(rec => {
        if (!selectedRecommendations.some(sRec => sRec.id === rec.id)) {
          snoozeRecommendation(rec, 'vaccine');
        }
      });
      petRec.bookingRecommendations.forEach(rec => {
        if (!selectedRecommendations.some(sRec => sRec.id === rec.id)) {
          snoozeRecommendation(rec, 'booking');
        }
      });
    });
    onClose();
  };

    let isNextButtonDisabled = false;
    // if (currentStep === 1) {
    //   isNextButtonDisabled = !petData;
    // }
    if (currentStep === 2) {
      isNextButtonDisabled = selectedRecommendations.length === 0;
    } else if (currentStep === 3) {
      isNextButtonDisabled = !selectedDate || !selectedTime;
    }
  const handleBack = () => {
    if (currentStep === 1 && !petData) {
      onClose();
    } else {
      back();
    }
  };

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
            <PetManagement />
          )}

          {currentStep === 2 && (
            <RecommendationSelection
              petRecommendations={petRecommendations}
              selectedRecommendations={selectedRecommendations}
              onSelectRecommendations={setSelectedRecommendations}
              setCurrentStep={setCurrentStep}
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
              selectedRecommendations={selectedRecommendations}
              mockGetAvailableSlots={mockGetAvailableSlots}
            />
          )}

          {currentStep === 4 && (
            <Confirmation
              petRecommendations={petRecommendations}
              date={selectedDate!}
              time={selectedTime!}
              selectedRecommendations={selectedRecommendations}
              services={services}
            />
          )}
        </div>

        <div className="booking-flow-footer">
          {currentStep > 1 ? (
            <button className="secondary-button" onClick={handleBack}>
              Voltar
            </button>
          ) : null}

          <button
            className="primary-button"
            onClick={currentStep === steps.length ? handleCompleteBooking : next}
            disabled={isNextButtonDisabled}
          >
            {currentStep === steps.length ? 'Confirmar Agendamento' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  );
};