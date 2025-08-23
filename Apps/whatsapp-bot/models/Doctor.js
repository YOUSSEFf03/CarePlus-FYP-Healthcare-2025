const db = require('../database/connection');
const { VERIFICATION_STATUS } = require('../config/constants');

class Doctor {
  constructor(doctorData) {
    this.doctor_id = doctorData.doctor_id;
    this.user_id = doctorData.user_id;
    this.name = doctorData.name;
    this.specialization = doctorData.specialization;
    this.license_number = doctorData.license_number;
    this.verification_status = doctorData.verification_status || VERIFICATION_STATUS.PENDING;
    this.region_id = doctorData.region_id;
    this.created_at = doctorData.created_at;
    this.updated_at = doctorData.updated_at;
    
    // Joined data
    this.region_name = doctorData.region_name;
  }

  static async findById(doctorId) {
    const query = `
      SELECT d.*, r.name as region_name
      FROM doctors d
      JOIN regions r ON d.region_id = r.region_id
      WHERE d.doctor_id = $1
    `;
    const result = await db.query(query, [doctorId]);
    return result.rows[0] ? new Doctor(result.rows[0]) : null;
  }

  static async findByUserId(userId) {
    const query = `
      SELECT d.*, r.name as region_name
      FROM doctors d
      JOIN regions r ON d.region_id = r.region_id
      WHERE d.user_id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0] ? new Doctor(result.rows[0]) : null;
  }

  static async findByRegion(regionId) {
    const query = `
      SELECT d.*, r.name as region_name
      FROM doctors d
      JOIN regions r ON d.region_id = r.region_id
      WHERE d.region_id = $1 AND d.verification_status = $2
    `;
    const result = await db.query(query, [regionId, VERIFICATION_STATUS.VERIFIED]);
    return result.rows.map(row => new Doctor(row));
  }

  static async findBySpecialization(specialization, regionId) {
    const query = `
      SELECT d.*, r.name as region_name
      FROM doctors d
      JOIN regions r ON d.region_id = r.region_id
      WHERE d.specialization = $1 AND d.region_id = $2 AND d.verification_status = $3
    `;
    const result = await db.query(query, [specialization, regionId, VERIFICATION_STATUS.VERIFIED]);
    return result.rows.map(row => new Doctor(row));
  }

  static async findAll() {
    const query = `
      SELECT d.*, r.name as region_name
      FROM doctors d
      JOIN regions r ON d.region_id = r.region_id
      WHERE d.verification_status = $1
    `;
    const result = await db.query(query, [VERIFICATION_STATUS.VERIFIED]);
    return result.rows.map(row => new Doctor(row));
  }

  static async create(doctorData) {
    const { user_id, name, specialization, license_number, region_id, verification_status = VERIFICATION_STATUS.PENDING } = doctorData;
    const query = `
      INSERT INTO doctors (user_id, name, specialization, license_number, region_id, verification_status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [user_id, name, specialization, license_number, region_id, verification_status];
    const result = await db.query(query, values);
    return new Doctor(result.rows[0]);
  }

  async update(updates) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    values.push(this.doctor_id);
    
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const query = `
      UPDATE doctors 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE doctor_id = $${fields.length + 1}
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    return new Doctor(result.rows[0]);
  }

  isVerified() {
    return this.verification_status === VERIFICATION_STATUS.VERIFIED;
  }

  verify() {
    return this.update({ verification_status: VERIFICATION_STATUS.VERIFIED });
  }

  reject() {
    return this.update({ verification_status: VERIFICATION_STATUS.REJECTED });
  }
}

module.exports = Doctor;