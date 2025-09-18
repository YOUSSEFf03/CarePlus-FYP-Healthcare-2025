const { doctorDb } = require('../connections');

const SlotQueries = {
  generateSlots: async (doctorId, workplaceId, startDate, days = 14) => {
    // This would be a complex function to generate slots for a doctor
    // For now, we'll just return a placeholder
    return [];
  },

  getAvailableSlots: async (doctorId, date) => {
    const query = `
      SELECT s.*, d.specialization, w.workplace_name
      FROM appointment_slots s
      JOIN doctors d ON s.doctor_id = d.id
      JOIN doctor_workplaces w ON s.workplace_id = w.id
      WHERE s.doctor_id = $1 AND s.slot_date = $2 AND s.is_available = true
      ORDER BY s.start_time ASC
    `;
    const result = await doctorDb.query(query, [doctorId, date]);
    return result.rows;
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