const db = require('../database/connection');
const User = require('./User');

class Patient {
  constructor(patientData) {
    this.patient_id = patientData.patient_id;
    this.user_id = patientData.user_id;
    this.date_of_birth = patientData.date_of_birth;
    this.gender = patientData.gender;
    this.medical_history = patientData.medical_history;
    this.created_at = patientData.created_at;
    this.updated_at = patientData.updated_at;
    
    // Joined user data
    this.user = patientData.user;
  }

  static async findByUserId(userId) {
    const query = `
      SELECT p.*, u.phone, u.name, u.email
      FROM patients p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.user_id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0] ? new Patient(result.rows[0]) : null;
  }

  static async findByPhone(phone) {
    const query = `
      SELECT p.*, u.phone, u.name, u.email
      FROM patients p
      JOIN users u ON p.user_id = u.user_id
      WHERE u.phone = $1
    `;
    const result = await db.query(query, [phone]);
    return result.rows[0] ? new Patient(result.rows[0]) : null;
  }

  static async create(patientData) {
    const { user_id, date_of_birth, gender, medical_history = '' } = patientData;
    const query = `
      INSERT INTO patients (user_id, date_of_birth, gender, medical_history)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [user_id, date_of_birth, gender, medical_history];
    const result = await db.query(query, values);
    return new Patient(result.rows[0]);
  }

  async update(updates) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    values.push(this.patient_id);
    
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const query = `
      UPDATE patients 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE patient_id = $${fields.length + 1}
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    return new Patient(result.rows[0]);
  }

  getAge() {
    const today = new Date();
    const birthDate = new Date(this.date_of_birth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}

module.exports = Patient;