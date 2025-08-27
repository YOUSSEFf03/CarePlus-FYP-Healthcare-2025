const { generateDateRange, isWorkingDay } = require('../utils/dateHelpers');
const SlotQueries = require('../database/queries/slots');

class AppointmentService {
  static async generateDoctorSlots(doctorId, workplaceId, startDate = new Date(), days = 14) {
    const dates = generateDateRange(startDate, days);
    const slots = [];
    
    for (const date of dates) {
      for (let hour = 9; hour < 17; hour++) {
        // :00 slot
        const startTime1 = new Date(date);
        startTime1.setHours(hour, 0, 0, 0);
        const endTime1 = new Date(date);
        endTime1.setHours(hour, 30, 0, 0);
        
        slots.push({
          doctor_id: doctorId,
          workplace_id: workplaceId,
          date: new Date(date.setHours(0, 0, 0, 0)),
          start_time: startTime1,
          end_time: endTime1,
          is_available: true
        });
        
        // :30 slot
        const startTime2 = new Date(date);
        startTime2.setHours(hour, 30, 0, 0);
        const endTime2 = new Date(date);
        endTime2.setHours(hour + 1, 0, 0, 0);
        
        slots.push({
          doctor_id: doctorId,
          workplace_id: workplaceId,
          date: new Date(date.setHours(0, 0, 0, 0)),
          start_time: startTime2,
          end_time: endTime2,
          is_available: true
        });
      }
    }
    
    // In a real implementation, you would save these slots to the database
    // await SlotQueries.bulkCreateSlots(slots);
    
    return slots;
  }

  static async getAvailableSlotsForDoctor(doctorId, date) {
    return await SlotQueries.getAvailableSlots(doctorId, date);
  }

  static async reserveSlot(slotId) {
    return await SlotQueries.reserveSlot(slotId);
  }

  static async releaseSlot(slotId) {
    return await SlotQueries.releaseSlot(slotId);
  }

  static async isSlotAvailable(slotId) {
    const slot = await SlotQueries.getSlotById(slotId);
    return slot && slot.is_available;
  }
}

module.exports = AppointmentService;