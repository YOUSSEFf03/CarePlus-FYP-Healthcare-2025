const { doctorDb } = require('../connections');
const { authDb } = require('../connections');

const DoctorQueries = {
  getAllDoctors: async () => {
    const query = `
      SELECT d.*, w.workplace_name, w.workplace_type
      FROM doctors d
      LEFT JOIN doctor_workplaces w ON d.id = w."doctorId"
      WHERE d.verification_status = 'approved'
    `;
    const result = await doctorDb.query(query);
    
    // Get user names for each doctor
    const doctorsWithNames = await Promise.all(
      result.rows.map(async (doctor) => {
        const userQuery = 'SELECT name FROM users WHERE id = $1';
        const userResult = await authDb.query(userQuery, [doctor.userId]);
        return {
          ...doctor,
          name: userResult.rows[0]?.name || 'Unknown Doctor'
        };
      })
    );
    
    return doctorsWithNames;
  },

  getDoctorsByRegion: async (regionId) => {
    // Since your doctor schema doesn't have region_id, we'll return all doctors for now
    // You may need to add region support to your doctor schema
    const query = `
      SELECT d.*, w.workplace_name, w.workplace_type
      FROM doctors d
      LEFT JOIN doctor_workplaces w ON d.id = w."doctorId"
      WHERE d.verification_status = 'approved'
    `;
    const result = await doctorDb.query(query);
    
    // Get user names for each doctor
    const doctorsWithNames = await Promise.all(
      result.rows.map(async (doctor) => {
        const userQuery = 'SELECT name FROM users WHERE id = $1';
        const userResult = await authDb.query(userQuery, [doctor.userId]);
        return {
          ...doctor,
          name: userResult.rows[0]?.name || 'Unknown Doctor'
        };
      })
    );
    
    return doctorsWithNames;
  },

  getDoctorsBySpecialization: async (specialization, regionId) => {
    const query = `
      SELECT d.*, w.workplace_name, w.workplace_type
      FROM doctors d
      LEFT JOIN doctor_workplaces w ON d.id = w."doctorId"
      WHERE d.specialization = $1 AND d.verification_status = 'approved'
    `;
    const result = await doctorDb.query(query, [specialization]);
    
    // Get user names for each doctor
    const doctorsWithNames = await Promise.all(
      result.rows.map(async (doctor) => {
        const userQuery = 'SELECT name FROM users WHERE id = $1';
        const userResult = await authDb.query(userQuery, [doctor.userId]);
        return {
          ...doctor,
          name: userResult.rows[0]?.name || 'Unknown Doctor'
        };
      })
    );
    
    return doctorsWithNames;
  },

  getDoctorById: async (doctorId) => {
    const query = `
      SELECT d.*, w.workplace_name, w.workplace_type
      FROM doctors d
      LEFT JOIN doctor_workplaces w ON d.id = w."doctorId"
      WHERE d.id = $1
    `;
    const result = await doctorDb.query(query, [doctorId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const doctor = result.rows[0];
    const userQuery = 'SELECT name FROM users WHERE id = $1';
    const userResult = await authDb.query(userQuery, [doctor.userId]);
    
    return {
      ...doctor,
      name: userResult.rows[0]?.name || 'Unknown Doctor'
    };
  },

  getWorkplaceIdByDoctorId: async (doctorId) => {
    const query = `
      SELECT w.id as workplace_id
      FROM doctor_workplaces w
      WHERE w."doctorId" = $1
      LIMIT 1
    `;
    const result = await doctorDb.query(query, [doctorId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0].workplace_id;
  }
};

module.exports = DoctorQueries;