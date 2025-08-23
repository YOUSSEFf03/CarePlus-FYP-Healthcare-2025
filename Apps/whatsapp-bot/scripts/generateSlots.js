const db = require('../database/connection');
const Slot = require('../models/Slot');
const { generateDateRange, isWorkingDay } = require('../utils/dateHelpers');

async function generateSlotsForAllDoctors() {
  try {
    console.log('Starting slot generation for all doctors...');
    
    // Get all verified doctors
    const doctorsResult = await db.query(`
      SELECT d.doctor_id, w.workplace_id 
      FROM doctors d
      JOIN doctor_workplaces w ON d.doctor_id = w.doctor_id
      WHERE d.verification_status = 'verified'
    `);
    
    const doctors = doctorsResult.rows;
    console.log(`Found ${doctors.length} verified doctors`);
    
    let totalSlotsGenerated = 0;
    
    for (const doctor of doctors) {
      const slotsGenerated = await generateSlotsForDoctor(
        doctor.doctor_id, 
        doctor.workplace_id
      );
      totalSlotsGenerated += slotsGenerated;
    }
    
    console.log(`Generated ${totalSlotsGenerated} slots for ${doctors.length} doctors`);
    process.exit(0);
  } catch (error) {
    console.error('Error generating slots:', error);
    process.exit(1);
  }
}

async function generateSlotsForDoctor(doctorId, workplaceId, days = 14) {
  try {
    const startDate = new Date();
    const dates = generateDateRange(startDate, days);
    const slots = [];
    
    for (const date of dates) {
      for (let hour = 9; hour < 17; hour++) {
        // Skip lunch time (12:00-13:00)
        if (hour === 12) continue;
        
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
    
    // Delete existing slots for this doctor in the date range
    await db.query(`
      DELETE FROM appointment_slots 
      WHERE doctor_id = $1 AND date >= $2 AND date <= $3
    `, [doctorId, dates[0], dates[dates.length - 1]]);
    
    // Insert new slots
    if (slots.length > 0) {
      await Slot.bulkCreate(slots);
    }
    
    console.log(`Generated ${slots.length} slots for doctor ${doctorId}`);
    return slots.length;
  } catch (error) {
    console.error(`Error generating slots for doctor ${doctorId}:`, error);
    return 0;
  }
}

// Run if called directly
if (require.main === module) {
  generateSlotsForAllDoctors();
}

module.exports = {
  generateSlotsForAllDoctors,
  generateSlotsForDoctor
};