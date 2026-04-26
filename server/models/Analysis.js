const db = require('../config/db');

const Analysis = {
  create: async (data) => {
    const { userId, imageUrl, result } = data;
    const query = `
      INSERT INTO analyses (user_id, image_url, result)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const resultSet = await db.query(query, [userId, imageUrl, JSON.stringify(result)]);
    return resultSet.rows[0];
  },

  findByUser: async (userId, options = {}) => {
    let query = 'SELECT * FROM analyses WHERE user_id = $1';
    const params = [userId];

    if (options.sort) {
      query += ` ORDER BY ${options.sort.field} ${options.sort.order}`;
    }
    if (options.limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(options.limit);
    }

    const resultSet = await db.query(query, params);
    return resultSet.rows;
  },

  findByIdAndUserId: async (id, userId) => {
    const result = await db.query(
      'SELECT * FROM analyses WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rows[0];
  },

  deleteById: async (id) => {
    const result = await db.query('DELETE FROM analyses WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  },

  // For admin: get all with user details
  findAllWithUser: async (limit = 100) => {
    const query = `
      SELECT a.*, u.name as user_name, u.email as user_email
      FROM analyses a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
      LIMIT $1
    `;
    const result = await db.query(query, [limit]);
    return result.rows;
  },

  // Count all
  countAll: async () => {
    const result = await db.query('SELECT COUNT(*) FROM analyses');
    return parseInt(result.rows[0].count);
  },

  // Delete many by user id
  deleteManyByUserId: async (userId) => {
    await db.query('DELETE FROM analyses WHERE user_id = $1', [userId]);
  }
};

module.exports = Analysis;
