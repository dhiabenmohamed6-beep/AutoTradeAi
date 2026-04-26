const db = require('../config/db');

const SupportTicket = {
  create: async (data) => {
    const { userId, subject, message } = data;
    // Initialize messages array with first user message
    const messages = JSON.stringify([{
      sender: 'user',
      content: message,
      createdAt: new Date().toISOString()
    }]);

    const query = `
      INSERT INTO support_tickets (user_id, subject, messages)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await db.query(query, [userId, subject, messages]);
    return result.rows[0];
  },

  findByUser: async (userId) => {
    const result = await db.query(
      'SELECT * FROM support_tickets WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId]
    );
    return result.rows;
  },

  findAll: async () => {
    const query = `
      SELECT s.*, u.name as user_name, u.email as user_email
      FROM support_tickets s
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.updated_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
  },

  findById: async (id) => {
    const result = await db.query('SELECT * FROM support_tickets WHERE id = $1', [id]);
    return result.rows[0];
  },

  addMessage: async (id, sender, content) => {
    const newMessage = {
      sender,
      content,
      createdAt: new Date().toISOString()
    };
    // Append new message to messages array
    const query = `
      UPDATE support_tickets
      SET messages = messages || $1::jsonb,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    // Pass as JSON array
    const result = await db.query(query, [JSON.stringify([newMessage]), id]);
    return result.rows[0];
  },

  close: async (id) => {
    const result = await db.query(
      "UPDATE support_tickets SET status = 'closed', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  },

  countOpen: async () => {
    const result = await db.query("SELECT COUNT(*) FROM support_tickets WHERE status = 'open'");
    return parseInt(result.rows[0].count);
  }
};

module.exports = SupportTicket;
