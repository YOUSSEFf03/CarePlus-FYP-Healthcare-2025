const { authDb } = require('../connections');

const PatientQueries = {
  createPatient: async (patientData) => {
    const { userId, date_of_birth, gender, medical_history = '' } = patientData;
    const query = `
      INSERT INTO patients ("userId", date_of_birth, gender, medical_history)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [userId, date_of_birth, gender, medical_history];
    const result = await authDb.query(query, values);
    return result.rows[0];
  },

  getPatientByUserId: async (userId) => {
    const query = `
      SELECT p.*, u.phone, u.name, u.email
      FROM patients p
      JOIN users u ON p."userId" = u.id
      WHERE p."userId" = $1
    `;
    const result = await authDb.query(query, [userId]);
    return result.rows[0];
  },

  getPatientByPhone: async (phone) => {
    const query = `
      SELECT p.*, u.phone, u.name, u.email
      FROM patients p
      JOIN users u ON p."userId" = u.id
      WHERE u.phone = $1
    `;
    const result = await authDb.query(query, [phone]);
    return result.rows[0];
  }
};

module.exports = PatientQueries;