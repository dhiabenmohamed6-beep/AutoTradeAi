const db = require('../config/db');

const Subscription = {
  create: async (data) => {
    const { userId, paymentMethod, status = 'pending', plan = 'premium', amount = 59, currency = 'DT' } = data;
    const query = `
      INSERT INTO subscriptions (user_id, plan, status, payment_method, amount, currency)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await db.query(query, [userId, plan, status, paymentMethod, amount, currency]);
    return result.rows[0];
  },

  findByUser: async (userId) => {
    const result = await db.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    return result.rows[0];
  },

  findById: async (id) => {
    const result = await db.query('SELECT * FROM subscriptions WHERE id = $1', [id]);
    return result.rows[0];
  },

  // For admin: get pending subscriptions with user details
  getPending: async () => {
    const query = `
      SELECT s.*, u.name as user_name, u.email as user_email
      FROM subscriptions s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE s.status = 'pending' AND s.approved = FALSE
      ORDER BY s.start_date DESC
    `;
    const result = await db.query(query);
    return result.rows;
  },

  update: async (id, data) => {
    const fields = [];
    const values = [];
    let counter = 1;

    Object.keys(data).forEach(key => {
      const pgKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      fields.push(`${pgKey} = $${counter}`);
      values.push(data[key]);
      counter++;
    });

    values.push(id);
    const query = `UPDATE subscriptions SET ${fields.join(', ')} WHERE id = $${counter} RETURNING *`;
    const result = await db.query(query, values);
    return result.rows[0];
  },

  // Count helpers
  countByStatus: async (status) => {
    const result = await db.query('SELECT COUNT(*) FROM subscriptions WHERE status = $1', [status]);
    return parseInt(result.rows[0].count);
  },

  countPending: async () => {
    const result = await db.query("SELECT COUNT(*) FROM subscriptions WHERE status = 'pending' AND approved = FALSE");
    return parseInt(result.rows[0].count);
  },

  countActive: async () => {
    const result = await db.query("SELECT COUNT(*) FROM subscriptions WHERE status = 'active' AND approved = TRUE");
    return parseInt(result.rows[0].count);
  }
};

module.exports = Subscription;
