const db = require('../connections');

const DoctorQueries = {
  getAllDoctors: async () => {
    const query = `
      SELECT d.*, r.name as region_name
      FROM doctors d
      JOIN regions r ON d.region_id = r.region_id
      WHERE d.verification_status = 'verified'
    `;
    const result = await db.query(query);
    return result.rows;
  },

  getDoctorsByRegion: async (regionId) => {
    const query = `
      SELECT d.*, r.name as region_name
      FROM doctors d
      JOIN regions r ON d.region_id = r.region_id
      WHERE d.region_id = $1 AND d.verification_status = 'verified'
    `;
    const result = await db.query(query, [regionId]);
    return result.rows;
  },

  getDoctorsBySpecialization: async (specialization, regionId) => {
    const query = `
      SELECT d.*, r.name as region_name
      FROM doctors d
      JOIN regions r ON d.region_id = r.region_id
      WHERE d.specialization = $1 AND d.region_id = $2 AND d.verification_status = 'verified'
    `;
    const result = await db.query(query, [specialization, regionId]);
    return result.rows;
  },

  getDoctorById: async (doctorId) => {
    const query = `
      SELECT d.*, r.name as region_name
      FROM doctors d
      JOIN regions r ON d.region_id = r.region_id
      WHERE d.doctor_id = $1
    `;
    const result = await db.query(query, [doctorId]);
    return result.rows[0];
  }
};

module.exports = DoctorQueries;