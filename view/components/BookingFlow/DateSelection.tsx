import React from 'react';
import { Service } from './types';
import './DateSelection.css';

interface Props {
  onSelect: (date: Date, time: string) => void;
  selectedDate?: Date | null;
  selectedTime?: string | null;
  selectedService?: Service | null;
  onConfirm: () => void;
}

function parseDurationToMinutes(duration: string) {
  // supports formats like '1h', '1h30', '90m'
  if (!duration) return 60;
  // better parsing: split by 'h' or 'm'
  if (duration.includes('h')) {
    const parts = duration.split('h');
    const hours = parseInt(parts[0], 10) || 0;
    const mins = parts[1] ? parseInt(parts[1].replace('m', '').replace(':', ''), 10) || 0 : 0;
    return hours * 60 + mins;
  }
  if (duration.includes('m')) {
    return parseInt(duration.replace('m', ''), 10) || 60;
  }
  // fallback: parse as number of hours
  const num = parseFloat(duration);
  if (!isNaN(num)) return Math.round(num * 60);
  return 60;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export const DateSelection: React.FC<Props> = ({ onSelect, selectedService, selectedDate, selectedTime }) => {
  const [tempDate, setTempDate] = React.useState<Date | null>(selectedDate || null);
  const [tempTime, setTempTime] = React.useState<string | null>(selectedTime || null);

  React.useEffect(() => {
    if (tempDate && tempTime) {
      onSelect(tempDate, tempTime);
    }
  }, [tempDate, tempTime, onSelect]);


  // If no service selected, ask user to pick one first
  if (!selectedService) {
    return (
      <div className="date-selection">
        <h2>Selecione a Data e Horário</h2>
        <p>Escolha um serviço primeiro para ver os horários disponíveis.</p>
      </div>
    );
  }

  const handleDateSelect = (date: Date) => {
    setTempDate(date);
  };

  const handleTimeSelect = (time: string) => {
    setTempTime(time);
  };

  const durationMin = parseDurationToMinutes(selectedService.duration);
  const openingHour = 9;
  const closingHour = 18; // last possible end time
  const slotStep = 30; // minutes between possible start times

  const today = new Date();
  const currentMonth = tempDate?.getMonth() ?? today.getMonth();
  const currentYear = tempDate?.getFullYear() ?? today.getFullYear();
  
  // Calendar generation
  const firstDay = new Date(currentYear, currentMonth, 1);
  const lastDay = new Date(currentYear, currentMonth + 1, 0);
  const startingDay = firstDay.getDay();
  const totalDays = lastDay.getDate();
  
  // Generate time slots
  const slots: string[] = [];
  const baseDate = tempDate || today;

  for (let hour = openingHour; hour < closingHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotStep) {
      const start = new Date(baseDate);
      start.setHours(hour, minute, 0, 0);
      const end = new Date(start.getTime() + durationMin * 60 * 1000);
      if (end.getHours() < closingHour || (end.getHours() === closingHour && end.getMinutes() === 0)) {
        slots.push(formatTime(start));
      }
    }
  }

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
      <h2>Selecione a Data e Horário</h2>
      
      <div className="calendar">
        <div className="calendar-header">
          <button onClick={prevMonth} className="nav-button">&lt;</button>
          <h3>{months[currentMonth]} {currentYear}</h3>
          <button onClick={nextMonth} className="nav-button">&gt;</button>
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
          {slots.length === 0 ? (
            <p>Sem horários disponíveis para o serviço selecionado.</p>
          ) : (
            slots.map((time) => (
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
