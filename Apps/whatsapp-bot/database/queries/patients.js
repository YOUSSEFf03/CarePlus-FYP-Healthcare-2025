const db = require('../connections');

const PatientQueries = {
  createPatient: async (patientData) => {
    const { user_id, date_of_birth, gender, medical_history = '' } = patientData;
    const query = `
      INSERT INTO patients (user_id, date_of_birth, gender, medical_history)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [user_id, date_of_birth, gender, medical_history];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  getPatientByUserId: async (userId) => {
    const query = `
      SELECT p.*, u.phone, u.name, u.email
      FROM patients p
      JOIN users u ON p.user_id = u.user_id
      WHERE p.user_id = $1
    `;
    const result = await db.query(query, [userId]);
    return result.rows[0];
  },

  getPatientByPhone: async (phone) => {
    const query = `
      SELECT p.*, u.phone, u.name, u.email
      FROM patients p
      JOIN users u ON p.user_id = u.user_id
      WHERE u.phone = $1
    `;
    const result = await db.query(query, [phone]);
    return result.rows[0];
  }
};

module.exports = PatientQueries;