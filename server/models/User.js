const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Password hashing middleware equivalent
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

const comparePassword = async (candidatePassword, hashedPassword) => {
  return await bcrypt.compare(candidatePassword, hashedPassword);
};

const User = {
  findByEmail: async (email) => {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  },

  findById: async (id) => {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0];
  },

  create: async (userData) => {
    const { email, password, name, trialExpiresAt, is_admin = false } = userData;
    const hashedPassword = await hashPassword(password);

    const result = await db.query(
      `INSERT INTO users (email, password, name, trial_expires_at, is_admin, trial_active)
       VALUES ($1, $2, $3, $4, $5, TRUE)
       RETURNING *`,
      [email, hashedPassword, name, trialExpiresAt, is_admin]
    );
    return result.rows[0];
  },

  update: async (id, userData) => {
    const fields = [];
    const values = [];
    let counter = 1;

    Object.keys(userData).forEach(key => {
      const pgKey = key.replace(/([A-Z])/g, '_$1').toLowerCase(); // camelCase to snake_case
      fields.push(`${pgKey} = $${counter}`);
      values.push(userData[key]);
      counter++;
    });

    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${counter} RETURNING *`;
    const result = await db.query(query, values);
    return result.rows[0];
  },

  getAll: async (options = {}) => {
    let query = 'SELECT id, email, name, is_admin, trial_active, trial_expires_at, subscription_active, subscription_plan, subscription_expires_at, created_at, updated_at FROM users';
    const params = [];

    if (options.sort) {
      query += ` ORDER BY ${options.sort.field} ${options.sort.order}`;
    } else {
      query += ' ORDER BY created_at DESC';
    }
    if (options.limit) {
      query += ` LIMIT $${params.length + 1}`;
      params.push(options.limit);
    }

    const result = await db.query(query, params);
    return result.rows;
  },

  countAll: async () => {
    const result = await db.query('SELECT COUNT(*) FROM users');
    return parseInt(result.rows[0].count);
  },

  deleteById: async (id) => {
    await db.query('DELETE FROM users WHERE id = $1', [id]);
  },

  verifyPassword: comparePassword
};

module.exports = User;
