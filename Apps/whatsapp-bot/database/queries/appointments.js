const db = require('../connections');

const AppointmentQueries = {
  createAppointment: async (appointmentData) => {
    const { patient_id, doctor_workplace_id, slot_id, notes = '' } = appointmentData;
    const query = `
      INSERT INTO appointments (patient_id, doctor_workplace_id, slot_id, notes)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [patient_id, doctor_workplace_id, slot_id, notes];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  getAppointmentById: async (appointmentId) => {
    const query = `
      SELECT a.*, p.patient_id, u.name as patient_name, u.phone as patient_phone,
             d.name as doctor_name, d.specialization, w.name as workplace_name,
             s.start_time, s.end_time
      FROM appointments a
      JOIN patients p ON a.patient_id = p.patient_id
      JOIN users u ON p.user_id = u.user_id
      JOIN doctor_workplaces w ON a.doctor_workplace_id = w.workplace_id
      JOIN doctors d ON w.doctor_id = d.doctor_id
      JOIN appointment_slots s ON a.slot_id = s.slot_id
      WHERE a.appointment_id = $1
    `;
    const result = await db.query(query, [appointmentId]);
    return result.rows[0];
  },

  getPatientAppointments: async (patientId) => {
    const query = `
      SELECT a.*, d.name as doctor_name, d.specialization, w.name as workplace_name,
             s.start_time, s.end_time
      FROM appointments a
      JOIN doctor_workplaces w ON a.doctor_workplace_id = w.workplace_id
      JOIN doctors d ON w.doctor_id = d.doctor_id
      JOIN appointment_slots s ON a.slot_id = s.slot_id
      WHERE a.patient_id = $1 AND a.status = 'booked'
      ORDER BY s.start_time ASC
    `;
    const result = await db.query(query, [patientId]);
    return result.rows;
  },

  updateAppointmentStatus: async (appointmentId, status) => {
    const query = `
      UPDATE appointments 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE appointment_id = $2
      RETURNING *
    `;
    const result = await db.query(query, [status, appointmentId]);
    return result.rows[0];
  },

  deleteAppointment: async (appointmentId) => {
    const query = 'DELETE FROM appointments WHERE appointment_id = $1 RETURNING *';
    const result = await db.query(query, [appointmentId]);
    return result.rows[0];
  }
};

module.exports = AppointmentQueries;