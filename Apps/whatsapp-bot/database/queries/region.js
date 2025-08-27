const db = require('../connections');

const RegionQueries = {
  getAllRegions: async () => {
    const query = 'SELECT * FROM regions ORDER BY name';
    const result = await db.query(query);
    return result.rows;
  },

  getRegionById: async (regionId) => {
    const query = 'SELECT * FROM regions WHERE region_id = $1';
    const result = await db.query(query, [regionId]);
    return result.rows[0];
  },

  getRegionByName: async (regionName) => {
    const query = 'SELECT * FROM regions WHERE LOWER(name) = LOWER($1)';
    const result = await db.query(query, [regionName]);
    return result.rows[0];
  },

  createRegion: async (regionData) => {
    const { name } = regionData;
    const query = 'INSERT INTO regions (name) VALUES ($1) RETURNING *';
    const result = await db.query(query, [name]);
    return result.rows[0];
  },

  updateRegion: async (regionId, updates) => {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    values.push(regionId);
    
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const query = `
      UPDATE regions 
      SET ${setClause}
      WHERE region_id = $${fields.length + 1}
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    return result.rows[0];
  },

  deleteRegion: async (regionId) => {
    const query = 'DELETE FROM regions WHERE region_id = $1 RETURNING *';
    const result = await db.query(query, [regionId]);
    return result.rows[0];
  }
};

module.exports = RegionQueries;