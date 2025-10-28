import React from 'react';
import './DateSelection.css';

interface Props {
  onSelect: (date: Date, time: string) => void;
  selectedDate?: Date | null;
  selectedTime?: string | null;
  availableSlots: string[];
  onConfirm: () => void;
}

export const DateSelection: React.FC<Props> = ({ onSelect, selectedDate, selectedTime, availableSlots }) => {
  const [tempDate, setTempDate] = React.useState<Date | null>(selectedDate || null);
  const [tempTime, setTempTime] = React.useState<string | null>(selectedTime || null);

  React.useEffect(() => {
    if (tempDate && tempTime) {
      onSelect(tempDate, tempTime);
    }
  }, [tempDate, tempTime, onSelect]);

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
      <h2>Selecione a Data e Horário</h2>
      
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
          {availableSlots.length === 0 ? (
            <p>Sem horários disponíveis para o serviço selecionado.</p>
          ) : (
            availableSlots.map((time) => (
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
