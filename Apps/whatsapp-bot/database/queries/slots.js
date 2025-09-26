const { doctorDb } = require('../connections');
const { convertFromLebanonTime, LEBANON_TIMEZONE } = require('../../utils/dateHelper');

const SlotQueries = {
  generateSlots: async (doctorId, workplaceId, startDate, days = 14) => {
    console.log('Generating slots for doctor:', doctorId, 'workplace:', workplaceId);
    console.log('Start date:', startDate.toISOString());
    console.log('Start date day:', startDate.getDate(), 'Month:', startDate.getMonth() + 1, 'Year:', startDate.getFullYear());
    
    const slots = [];
    let insertedCount = 0;
    
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      console.log(`Generating slots for day ${i + 1}: ${dateStr}`);
      
      // Check if slots already exist for this date
      const existingSlots = await doctorDb.query(`
        SELECT start_time FROM appointment_slots 
        WHERE doctor_id = $1 AND slot_date = $2
      `, [doctorId, dateStr]);
      
      const existingTimes = new Set(existingSlots.rows.map(row => row.start_time));
      console.log(`Found ${existingTimes.size} existing slots for ${dateStr}`);
      
      // Generate slots from 9 AM to 5 PM Lebanon time (30-minute intervals)
      for (let hour = 9; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;
          
          // Skip if slot already exists
          if (existingTimes.has(startTime)) {
            console.log(`Skipping existing slot: ${startTime}`);
            continue;
          }
          
          // Create datetime in Lebanon timezone
          const lebanonDateTime = new Date(currentDate);
          lebanonDateTime.setHours(hour, minute, 0, 0);
          
          // Convert to UTC for database storage
          const utcDateTime = convertFromLebanonTime(lebanonDateTime);
          
          const endHour = minute === 30 ? hour + 1 : hour;
          const endMinute = minute === 30 ? 0 : 30;
          const lebanonEndDateTime = new Date(currentDate);
          lebanonEndDateTime.setHours(endHour, endMinute, 0, 0);
          const utcEndDateTime = convertFromLebanonTime(lebanonEndDateTime);
          
          slots.push({
            doctor_id: doctorId,
            workplace_id: workplaceId,
            date: dateStr,
            start_time: startTime,
            end_time: `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}:00`,
            is_available: true
          });
        }
      }
    }
    
    // Insert only new slots into database
    for (const slot of slots) {
      try {
        const insertQuery = `
          INSERT INTO appointment_slots (doctor_id, workplace_id, slot_date, start_time, end_time, is_available)
          VALUES ($1, $2, $3, $4, $5, $6)
        `;
        await doctorDb.query(insertQuery, [
          slot.doctor_id,
          slot.workplace_id,
          slot.date,
          slot.start_time,
          slot.end_time,
          slot.is_available
        ]);
        insertedCount++;
        console.log(`Inserted new slot: ${slot.start_time} for ${slot.date}`);
      } catch (error) {
        console.error('Error inserting slot:', error);
      }
    }
    
    console.log(`Generated ${slots.length} new slots, inserted ${insertedCount}`);
    return slots;
  },

  getAvailableSlots: async (doctorId, date) => {
    // Convert date to proper format for database query
    const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
    
    console.log('Querying slots for doctor:', doctorId, 'date:', dateStr);
    
    const query = `
      SELECT s.*, d.specialization, w.workplace_name
      FROM appointment_slots s
      JOIN doctors d ON s.doctor_id = d.id
      JOIN doctor_workplaces w ON s.workplace_id = w.id
      WHERE s.doctor_id = $1 AND s.slot_date = $2 AND s.is_available = true
      ORDER BY s.start_time ASC
    `;
    const result = await doctorDb.query(query, [doctorId, dateStr]);
    console.log('Found slots:', result.rows.length);
    return result.rows;
  },

  getAvailableSlotsExcludingBooked: async (doctorId, date, patientId = null) => {
    // Convert date to proper format for database query
    const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
    
    console.log('Querying available slots (excluding booked) for doctor:', doctorId, 'date:', dateStr);
    
    // Get all available slots
    const slotsQuery = `
      SELECT s.*, d.specialization, w.workplace_name
      FROM appointment_slots s
      JOIN doctors d ON s.doctor_id = d.id
      JOIN doctor_workplaces w ON s.workplace_id = w.id
      WHERE s.doctor_id = $1 AND s.slot_date = $2 AND s.is_available = true
      ORDER BY s.start_time ASC
    `;
    const slotsResult = await doctorDb.query(slotsQuery, [doctorId, dateStr]);
    
    // Get booked appointments for this doctor on this date
    const appointmentsQuery = `
      SELECT appointment_time
      FROM appointments
      WHERE "doctorId" = $1 AND appointment_date::date = $2 AND status = 'CONFIRMED'
    `;
    const appointmentsResult = await doctorDb.query(appointmentsQuery, [doctorId, dateStr]);
    
    // Get booked times
    const bookedTimes = new Set(appointmentsResult.rows.map(row => row.appointment_time));
    console.log('Booked times:', Array.from(bookedTimes));
    
    // Filter out booked slots
    const availableSlots = slotsResult.rows.filter(slot => {
      const slotTime = slot.start_time.substring(0, 5); // Get "HH:mm" format
      const isBooked = bookedTimes.has(slotTime + ':00') || bookedTimes.has(slotTime);
      return !isBooked;
    });
    
    console.log('Available slots after filtering:', availableSlots.length);
    return availableSlots;
  },

  reserveSlot: async (slotId) => {
    const query = `
      UPDATE appointment_slots 
      SET is_available = false
      WHERE id = $1
      RETURNING *
    `;
    const result = await doctorDb.query(query, [slotId]);
    return result.rows[0];
  },

  releaseSlot: async (slotId) => {
    const query = `
      UPDATE appointment_slots 
      SET is_available = true
      WHERE id = $1
      RETURNING *
    `;
    const result = await doctorDb.query(query, [slotId]);
    return result.rows[0];
  }
};

module.exports = SlotQueries;