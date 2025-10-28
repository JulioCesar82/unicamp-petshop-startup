import React from 'react';
import { Service } from './types';

interface Props {
  onSelect: (date: Date, time: string) => void;
  selectedDate?: Date | null;
  selectedTime?: string | null;
  selectedService?: Service | null;
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

export const DateSelection: React.FC<Props> = ({ onSelect, selectedService }) => {
  // If no service selected, ask user to pick one first
  if (!selectedService) {
    return (
      <div>
        <h2>Selecione a Data e Horário</h2>
        <p>Escolha um serviço primeiro para ver os horários disponíveis.</p>
      </div>
    );
  }

  const durationMin = parseDurationToMinutes(selectedService.duration);
  const openingHour = 9;
  const closingHour = 18; // last possible end time
  const slotStep = 30; // minutes between possible start times

  const slots: string[] = [];
  const today = new Date();
  const baseDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

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

  return (
    <div>
      <h2>Selecione a Data e Horário</h2>
      <div className="time-slots">
        {slots.length === 0 ? (
          <p>Sem horários disponíveis para o serviço selecionado.</p>
        ) : (
          slots.map((time) => (
            <button key={time} className="time-slot-button" onClick={() => onSelect(new Date(), time)}>
              {time}
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default DateSelection;
