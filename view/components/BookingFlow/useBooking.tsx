import React from 'react';
import { Pet, Service } from '../../domain/entities';
import { CreateBooking } from '../../application/CreateBooking';

interface UseBookingOptions {
  initialStep?: number;
  onComplete?: () => void;
}

export function useBooking(createBookingUseCase: CreateBooking, options: UseBookingOptions = {}) {
  const { initialStep = 1, onComplete } = options;
  const steps = ['Cadastro', 'Serviço', 'Agendamento', 'Confirmação'];
  const [currentStep, setCurrentStep] = React.useState<number>(initialStep);
  const [petData, setPetData] = React.useState<Pet | null>(null);
  const [selectedService, setSelectedService] = React.useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);

  const next = React.useCallback(() => {
    console.log('Current Step before next():', currentStep);
    setCurrentStep(s => Math.min(s + 1, steps.length));
  }, []);

  const back = React.useCallback(() => {
    setCurrentStep(s => Math.max(s - 1, 1));
  }, []);

  const complete = React.useCallback(async () => {
    if (petData && selectedService && selectedDate && selectedTime) {
      await createBookingUseCase.execute({
        pet: petData,
        service: selectedService,
        date: selectedDate,
        time: selectedTime,
      });
      onComplete?.();
    }
  }, [petData, selectedService, selectedDate, selectedTime, createBookingUseCase, onComplete]);

  return {
    steps,
    currentStep,
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
  } as const;
}

export default useBooking;
