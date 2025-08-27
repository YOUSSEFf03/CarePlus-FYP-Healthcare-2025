const db = require('../connections');

const SlotQueries = {
  generateSlots: async (doctorId, workplaceId, startDate, days = 14) => {
    // This would be a complex function to generate slots for a doctor
    // For now, we'll just return a placeholder
    return [];
  },

  getAvailableSlots: async (doctorId, date) => {
    const query = `
      SELECT s.*, d.name as doctor_name, w.name as workplace_name
      FROM appointment_slots s
      JOIN doctors d ON s.doctor_id = d.doctor_id
      JOIN doctor_workplaces w ON s.workplace_id = w.workplace_id
      WHERE s.doctor_id = $1 AND s.date = $2 AND s.is_available = true
      ORDER BY s.start_time ASC
    `;
    const result = await db.query(query, [doctorId, date]);
    return result.rows;
  },

  reserveSlot: async (slotId) => {
    const query = `
      UPDATE appointment_slots 
      SET is_available = false
      WHERE slot_id = $1
      RETURNING *
    `;
    const result = await db.query(query, [slotId]);
    return result.rows[0];
  },

  releaseSlot: async (slotId) => {
    const query = `
      UPDATE appointment_slots 
      SET is_available = true
      WHERE slot_id = $1
      RETURNING *
    `;
    const result = await db.query(query, [slotId]);
    return result.rows[0];
  }
};

module.exports = SlotQueries;