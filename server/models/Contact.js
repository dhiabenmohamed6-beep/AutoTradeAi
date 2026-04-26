const db = require('../config/db');

const Contact = {
  create: async (data) => {
    const { name, email, message } = data;
    const query = `
      INSERT INTO contacts (name, email, message)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await db.query(query, [name, email, message]);
    return result.rows[0];
  },

  findAll: async (options = {}) => {
    let query = 'SELECT * FROM contacts';
    const params = [];

    if (options.sort) {
      query += ` ORDER BY ${options.sort.field} ${options.sort.order}`;
    }
    if (options.limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(options.limit);
    }

    const result = await db.query(query, params);
    return result.rows;
  },

  findById: async (id) => {
    const result = await db.query('SELECT * FROM contacts WHERE id = $1', [id]);
    return result.rows[0];
  },

  markAsRead: async (id) => {
    const result = await db.query(
      'UPDATE contacts SET is_read = TRUE WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },

  // Count unread
  countUnread: async () => {
    const result = await db.query("SELECT COUNT(*) FROM contacts WHERE is_read = FALSE");
    return parseInt(result.rows[0].count);
  }
};

module.exports = Contact;
