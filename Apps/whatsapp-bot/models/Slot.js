const db = require('../database/connection');

class Slot {
  constructor(slotData) {
    this.slot_id = slotData.slot_id;
    this.doctor_id = slotData.doctor_id;
    this.workplace_id = slotData.workplace_id;
    this.date = slotData.date;
    this.start_time = slotData.start_time;
    this.end_time = slotData.end_time;
    this.is_available = slotData.is_available;
    this.created_at = slotData.created_at;
    
    // Joined data
    this.doctor_name = slotData.doctor_name;
    this.workplace_name = slotData.workplace_name;
  }

  static async findById(slotId) {
    const query = 'SELECT * FROM appointment_slots WHERE slot_id = $1';
    const result = await db.query(query, [slotId]);
    return result.rows[0] ? new Slot(result.rows[0]) : null;
  }

  static async findByDoctorAndDate(doctorId, date) {
    const query = `
      SELECT s.*, d.name as doctor_name, w.name as workplace_name
      FROM appointment_slots s
      JOIN doctors d ON s.doctor_id = d.doctor_id
      JOIN doctor_workplaces w ON s.workplace_id = w.workplace_id
      WHERE s.doctor_id = $1 AND s.date = $2 AND s.is_available = true
      ORDER BY s.start_time ASC
    `;
    const result = await db.query(query, [doctorId, date]);
    return result.rows.map(row => new Slot(row));
  }

  static async findAvailableByDoctor(doctorId, startDate, endDate) {
    const query = `
      SELECT s.*, d.name as doctor_name, w.name as workplace_name
      FROM appointment_slots s
      JOIN doctors d ON s.doctor_id = d.doctor_id
      JOIN doctor_workplaces w ON s.workplace_id = w.workplace_id
      WHERE s.doctor_id = $1 AND s.date BETWEEN $2 AND $3 AND s.is_available = true
      ORDER BY s.date, s.start_time ASC
    `;
    const result = await db.query(query, [doctorId, startDate, endDate]);
    return result.rows.map(row => new Slot(row));
  }

  static async create(slotData) {
    const { doctor_id, workplace_id, date, start_time, end_time, is_available = true } = slotData;
    const query = `
      INSERT INTO appointment_slots (doctor_id, workplace_id, date, start_time, end_time, is_available)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [doctor_id, workplace_id, date, start_time, end_time, is_available];
    const result = await db.query(query, values);
    return new Slot(result.rows[0]);
  }

  static async bulkCreate(slotsData) {
    const values = [];
    const valuePlaceholders = [];
    let paramCount = 1;

    slotsData.forEach((slot, index) => {
      const valueSet = [
        slot.doctor_id,
        slot.workplace_id,
        slot.date,
        slot.start_time,
        slot.end_time,
        slot.is_available !== undefined ? slot.is_available : true
      ];
      
      const placeholders = valueSet.map(() => `$${paramCount++}`).join(', ');
      valuePlaceholders.push(`(${placeholders})`);
      values.push(...valueSet);
    });

    const query = `
      INSERT INTO appointment_slots (doctor_id, workplace_id, date, start_time, end_time, is_available)
      VALUES ${valuePlaceholders.join(', ')}
      RETURNING *
    `;

    const result = await db.query(query, values);
    return result.rows.map(row => new Slot(row));
  }

  async update(updates) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    values.push(this.slot_id);
    
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const query = `
      UPDATE appointment_slots 
      SET ${setClause}
      WHERE slot_id = $${fields.length + 1}
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    return new Slot(result.rows[0]);
  }

  reserve() {
    return this.update({ is_available: false });
  }

  release() {
    return this.update({ is_available: true });
  }

  isAvailable() {
    return this.is_available;
  }

  isPast() {
    return new Date() > this.start_time;
  }

  durationInMinutes() {
    return (this.end_time - this.start_time) / (1000 * 60);
  }
}

module.exports = Slot;