const { authDb } = require('../connections');

const UserQueries = {
  createUser: async (userData) => {
    const { phone, name, email, role = 'patient' } = userData;
    const query = `
      INSERT INTO users (phone, name, email, role, password)
      VALUES ($1, $2, $3, $4, '')
      RETURNING *
    `;
    const values = [phone, name, email, role];
    const result = await authDb.query(query, values);
    return result.rows[0];
  },

  getUserByPhone: async (phone) => {
    const query = 'SELECT * FROM users WHERE phone = $1';
    const result = await authDb.query(query, [phone]);
    return result.rows[0];
  },

  getUserById: async (userId) => {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await authDb.query(query, [userId]);
    return result.rows[0];
  },

  updateUser: async (userId, updates) => {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    values.push(userId);
    
    const setClause = fields.map((field, index) => `${field} = $${index + 1}`).join(', ');
    
    const query = `
      UPDATE users 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${fields.length + 1}
      RETURNING *
    `;
    
    const result = await authDb.query(query, values);
    return result.rows[0];
  }
};

module.exports = UserQueries;