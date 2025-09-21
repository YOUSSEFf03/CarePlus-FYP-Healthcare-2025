const { doctorDb } = require('../connections');

const AppointmentQueries = {
  createAppointment: async (appointmentData) => {
    const { patientId, doctorId, appointment_date, appointment_time, notes = '' } = appointmentData;
    const query = `
      INSERT INTO appointments ("patientId", "doctorId", appointment_date, appointment_time, notes, status)
      VALUES ($1, $2, $3, $4, $5, 'CONFIRMED')
      RETURNING *
    `;
    const values = [patientId, doctorId, appointment_date, appointment_time, notes];
    const result = await doctorDb.query(query, values);
    return result.rows[0];
  },

  getAppointmentById: async (appointmentId) => {
    const query = `
      SELECT a.*, u.name as patient_name, u.phone as patient_phone,
             d.specialization, w.name as workplace_name
      FROM appointments a
      JOIN patients p ON a."patientId" = p.id
      JOIN users u ON p."userId" = u.id
      JOIN doctors d ON a."doctorId" = d.id
      JOIN doctor_workplaces w ON d.id = w."doctorId"
      WHERE a.id = $1
    `;
    const result = await doctorDb.query(query, [appointmentId]);
    return result.rows[0];
  },

  getPatientAppointments: async (patientId) => {
    const query = `
      SELECT a.*, d.specialization, w.workplace_name
      FROM appointments a
      JOIN doctors d ON a."doctorId" = d.id::text
      JOIN doctor_workplaces w ON w."doctorId"::text = d.id::text
      WHERE a."patientId" = $1 AND a.status = 'CONFIRMED'
      ORDER BY a.appointment_date ASC, a.appointment_time ASC
    `;
    const result = await doctorDb.query(query, [patientId]);
    return result.rows;
  },
  updateAppointmentStatus: async (appointmentId, status) => {
    const query = `
      UPDATE appointments 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    const result = await doctorDb.query(query, [status, appointmentId]);
    return result.rows[0];
  },

  deleteAppointment: async (appointmentId) => {
    const query = 'DELETE FROM appointments WHERE id = $1 RETURNING *';
    const result = await doctorDb.query(query, [appointmentId]);
    return result.rows[0];
  }
};

module.exports = AppointmentQueries;