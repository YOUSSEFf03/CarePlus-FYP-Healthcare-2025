const db = require('../database/connection');
const { USER_ROLES } = require('../config/constants');

class User {
  constructor(userData) {
    this.user_id = userData.user_id;
    this.phone = userData.phone;
    this.name = userData.name;
    this.email = userData.email;
    this.role = userData.role || USER_ROLES.PATIENT;
    this.profile_picture_url = userData.profile_picture_url;
    this.created_at = userData.created_at;
    this.updated_at = userData.updated_at;
  }

  static async findByPhone(phone) {
    const query = 'SELECT * FROM users WHERE phone = $1';
    const result = await db.query(query, [phone]);
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  static async findById(userId) {
    const query = 'SELECT * FROM users WHERE user_id = $1';
    const result = await db.query(query, [userId]);
    return result.rows[0] ? new User(result.rows[0]) : null;
  }

  static async create(userData) {
    const { phone, name, email, role = USER_ROLES.PATIENT, profile_picture_url = '' } = userData;
    const query = `
      INSERT INTO users (phone, name, email, role, profile_picture_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [phone, name, email, role, profile_picture_url];
    const result = await db.query(query, values);
    return new User(result.rows[0]);
  }

  async update(updates) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    values.push(this.user_id);
    
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const query = `
      UPDATE users 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $${fields.length + 1}
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    return new User(result.rows[0]);
  }

  isAdmin() {
    return this.role === USER_ROLES.ADMIN;
  }

  isDoctor() {
    return this.role === USER_ROLES.DOCTOR;
  }

  isPatient() {
    return this.role === USER_ROLES.PATIENT;
  }
}

module.exports = User;