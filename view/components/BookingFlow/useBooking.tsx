import React from 'react';
import { PetRegistrationData, Service, UseBookingOptions } from './types';

export function useBooking(options?: UseBookingOptions) {
  const steps = ['Cadastro', 'Serviço', 'Data', 'Confirmação'];
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [petData, setPetData] = React.useState<PetRegistrationData | null>(null);
  const [selectedService, setSelectedService] = React.useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = React.useState<string | null>(null);

  const next = React.useCallback(() => {
    setCurrentStep(s => Math.min(s + 1, steps.length));
  }, []);

  const back = React.useCallback(() => {
    setCurrentStep(s => Math.max(s - 1, 1));
  }, []);

  const complete = React.useCallback(() => {
    // place to add saving logic, API calls, analytics, etc.
    options?.onComplete && options.onComplete();
  }, [options]);

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
