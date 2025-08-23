const db = require('../connections');

const WorkplaceQueries = {
  getAllWorkplaces: async () => {
    const query = `
      SELECT w.*, r.name as region_name, d.name as doctor_name
      FROM doctor_workplaces w
      JOIN regions r ON w.region_id = r.region_id
      JOIN doctors d ON w.doctor_id = d.doctor_id
      ORDER BY w.name
    `;
    const result = await db.query(query);
    return result.rows;
  },

  getWorkplaceById: async (workplaceId) => {
    const query = `
      SELECT w.*, r.name as region_name, d.name as doctor_name
      FROM doctor_workplaces w
      JOIN regions r ON w.region_id = r.region_id
      JOIN doctors d ON w.doctor_id = d.doctor_id
      WHERE w.workplace_id = $1
    `;
    const result = await db.query(query, [workplaceId]);
    return result.rows[0];
  },

  getWorkplacesByRegion: async (regionId) => {
    const query = `
      SELECT w.*, r.name as region_name, d.name as doctor_name
      FROM doctor_workplaces w
      JOIN regions r ON w.region_id = r.region_id
      JOIN doctors d ON w.doctor_id = d.doctor_id
      WHERE w.region_id = $1
      ORDER BY w.name
    `;
    const result = await db.query(query, [regionId]);
    return result.rows;
  },

  getWorkplacesByDoctor: async (doctorId) => {
    const query = `
      SELECT w.*, r.name as region_name, d.name as doctor_name
      FROM doctor_workplaces w
      JOIN regions r ON w.region_id = r.region_id
      JOIN doctors d ON w.doctor_id = d.doctor_id
      WHERE w.doctor_id = $1
      ORDER BY w.name
    `;
    const result = await db.query(query, [doctorId]);
    return result.rows;
  },

  createWorkplace: async (workplaceData) => {
    const { doctor_id, name, type, region_id, phone, address = '' } = workplaceData;
    const query = `
      INSERT INTO doctor_workplaces (doctor_id, name, type, region_id, phone, address)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [doctor_id, name, type, region_id, phone, address];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  updateWorkplace: async (workplaceId, updates) => {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    values.push(workplaceId);
    
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const query = `
      UPDATE doctor_workplaces 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE workplace_id = $${fields.length + 1}
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    return result.rows[0];
  },

  deleteWorkplace: async (workplaceId) => {
    const query = 'DELETE FROM doctor_workplaces WHERE workplace_id = $1 RETURNING *';
    const result = await db.query(query, [workplaceId]);
    return result.rows[0];
  }
};

module.exports = WorkplaceQueries;