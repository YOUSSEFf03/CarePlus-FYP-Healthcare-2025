const db = require('../database/connection');
const { APPOINTMENT_STATUS } = require('../config/constants');

class Appointment {
  constructor(appointmentData) {
    this.appointment_id = appointmentData.appointment_id;
    this.patient_id = appointmentData.patient_id;
    this.doctor_workplace_id = appointmentData.doctor_workplace_id;
    this.slot_id = appointmentData.slot_id;
    this.appointment_date = appointmentData.appointment_date;
    this.status = appointmentData.status || APPOINTMENT_STATUS.BOOKED;
    this.notes = appointmentData.notes;
    this.created_at = appointmentData.created_at;
    this.updated_at = appointmentData.updated_at;
    
    // Joined data
    this.patient_name = appointmentData.patient_name;
    this.patient_phone = appointmentData.patient_phone;
    this.doctor_name = appointmentData.doctor_name;
    this.specialization = appointmentData.specialization;
    this.workplace_name = appointmentData.workplace_name;
    this.start_time = appointmentData.start_time;
    this.end_time = appointmentData.end_time;
  }

  static async findById(appointmentId) {
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
    return result.rows[0] ? new Appointment(result.rows[0]) : null;
  }

  static async findByPatientId(patientId) {
    const query = `
      SELECT a.*, d.name as doctor_name, d.specialization, w.name as workplace_name,
             s.start_time, s.end_time
      FROM appointments a
      JOIN doctor_workplaces w ON a.doctor_workplace_id = w.workplace_id
      JOIN doctors d ON w.doctor_id = d.doctor_id
      JOIN appointment_slots s ON a.slot_id = s.slot_id
      WHERE a.patient_id = $1 AND a.status = $2
      ORDER BY s.start_time ASC
    `;
    const result = await db.query(query, [patientId, APPOINTMENT_STATUS.BOOKED]);
    return result.rows.map(row => new Appointment(row));
  }

  static async findByDoctorId(doctorId, date) {
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
      WHERE d.doctor_id = $1 AND DATE(s.start_time) = $2 AND a.status = $3
      ORDER BY s.start_time ASC
    `;
    const result = await db.query(query, [doctorId, date, APPOINTMENT_STATUS.BOOKED]);
    return result.rows.map(row => new Appointment(row));
  }

  static async create(appointmentData) {
    const { patient_id, doctor_workplace_id, slot_id, notes = '' } = appointmentData;
    const query = `
      INSERT INTO appointments (patient_id, doctor_workplace_id, slot_id, notes)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [patient_id, doctor_workplace_id, slot_id, notes];
    const result = await db.query(query, values);
    return new Appointment(result.rows[0]);
  }

  async update(updates) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    values.push(this.appointment_id);
    
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const query = `
      UPDATE appointments 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE appointment_id = $${fields.length + 1}
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    return new Appointment(result.rows[0]);
  }

  cancel() {
    return this.update({ status: APPOINTMENT_STATUS.CANCELLED });
  }

  confirm() {
    return this.update({ status: APPOINTMENT_STATUS.CONFIRMED });
  }

  complete() {
    return this.update({ status: APPOINTMENT_STATUS.COMPLETED });
  }

  markAsNoShow() {
    return this.update({ status: APPOINTMENT_STATUS.NO_SHOW });
  }

  isBooked() {
    return this.status === APPOINTMENT_STATUS.BOOKED;
  }

  isCancelled() {
    return this.status === APPOINTMENT_STATUS.CANCELLED;
  }

  isCompleted() {
    return this.status === APPOINTMENT_STATUS.COMPLETED;
  }
}

module.exports = Appointment;