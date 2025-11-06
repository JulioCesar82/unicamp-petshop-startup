import React from 'react';
import './DateSelection.css';
import { GetAvailableSlots } from '../../application/GetAvailableSlots';
import { useRepositories } from '../../contexts/RepositoryContext';
import { Service, VaccineRecommendation, BookingRecommendation } from '../../domain/entities';

interface Props {
  onSelect: (date: Date, time: string) => void;
  selectedDate?: Date | null;
  selectedTime?: string | null;
  mockGetAvailableSlots?: boolean;
  selectedRecommendations: (VaccineRecommendation | BookingRecommendation)[];
  onConfirm: () => void;
}

export const DateSelection: React.FC<Props> = ({ onSelect, selectedDate, selectedTime, mockGetAvailableSlots, selectedRecommendations }) => {
  const { availabilityRepository } = useRepositories();
  const [tempDate, setTempDate] = React.useState<Date | null>(selectedDate || null);
  const [tempTime, setTempTime] = React.useState<string | null>(selectedTime || null);
  const [internalAvailableSlots, setInternalAvailableSlots] = React.useState<string[]>([]);

  const getAvailableSlotsUseCase = React.useMemo(() =>
    new GetAvailableSlots(availabilityRepository, mockGetAvailableSlots),
    [availabilityRepository, mockGetAvailableSlots]
  );

  React.useEffect(() => {
    if (tempDate && tempTime) {
      onSelect(tempDate, tempTime);
    }
  }, [tempDate, tempTime, onSelect]);

  React.useEffect(() => {
    if (tempDate && selectedRecommendations.length > 0) {
      getAvailableSlotsUseCase.execute(tempDate, 60) // Assuming a default duration of 60 minutes
        .then(setInternalAvailableSlots);
    } else {
      setInternalAvailableSlots([]); // Clear slots if no date or duration
    }
  }, [tempDate, selectedRecommendations, getAvailableSlotsUseCase]);

  const handleDateSelect = (date: Date) => {
    setTempDate(date);
  };

  const handleTimeSelect = (time: string) => {
    setTempTime(time);
  };

  const today = new Date();
  const currentMonth = tempDate?.getMonth() ?? today.getMonth();
  const currentYear = tempDate?.getFullYear() ?? today.getFullYear();
  
  // Calendar generation
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const startingDay = firstDay.getDay();
  const totalDays = lastDay.getDate();
  
  // Month navigation
  const prevMonth = () => {
    const newDate = new Date(currentYear, currentMonth - 1);
    setTempDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentYear, currentMonth + 1);
    setTempDate(newDate);
  };

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="date-selection">
      <h2>Selecione a Data e Hora</h2>
      
      <div className="calendar">
        <div className="calendar-header">
          <button onClick={prevMonth} className="nav-button">{'<'}</button>
          <h3>{months[currentMonth]} {currentYear}</h3>
          <button onClick={nextMonth} className="nav-button">{'>'}</button>
        </div>

        <div className="weekdays">
          {weekDays.map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>

        <div className="days">
          {[...Array(startingDay)].map((_, index) => (
            <div key={`empty-${index}`} className="day empty"></div>
          ))}
          
          {[...Array(totalDays)].map((_, index) => {
            const day = index + 1;
            const date = new Date(currentYear, currentMonth, day);
            const isSelected = tempDate && 
              date.getDate() === tempDate.getDate() && 
              date.getMonth() === tempDate.getMonth() &&
              date.getFullYear() === tempDate.getFullYear();
            const isPast = date < today;

            return (
              <button
                key={day}
                className={`day ${isSelected ? 'selected' : ''} ${isPast ? 'past' : ''}`}
                onClick={() => handleDateSelect(date)}
                disabled={isPast}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      <div className="time-slots">
        <h3>Horários Disponíveis</h3>
        <div className="slots-grid">
          {internalAvailableSlots.length === 0 ? (
            <p>Sem horários disponíveis para o dia selecionado.</p>
          ) : (
            internalAvailableSlots.map((time) => (
              <button
                key={time}
                className={`time-slot-button ${tempTime === time ? 'selected' : ''}`}
                onClick={() => handleTimeSelect(time)}
              >
                {time}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DateSelection;
