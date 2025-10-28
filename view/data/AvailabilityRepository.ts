import { IAvailabilityRepository } from '../domain/repositories';

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export class AvailabilityRepository implements IAvailabilityRepository {
  async getAvailableSlots(date: Date, durationInMinutes: number): Promise<string[]> {
    const openingHour = 9;
    const closingHour = 18; // last possible end time
    const slotStep = 30; // minutes between possible start times

    const slots: string[] = [];
    
    for (let hour = openingHour; hour < closingHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotStep) {
        const start = new Date(date);
        start.setHours(hour, minute, 0, 0);
        
        const end = new Date(start.getTime() + durationInMinutes * 60 * 1000);
        
        if (end.getHours() < closingHour || (end.getHours() === closingHour && end.getMinutes() === 0)) {
          slots.push(formatTime(start));
        }
      }
    }
    
    // In a real application, this would check against a calendar API
    console.log(`Fetched ${slots.length} available slots for ${date.toDateString()} with duration ${durationInMinutes} minutes.`);
    return Promise.resolve(slots);
  }
}
