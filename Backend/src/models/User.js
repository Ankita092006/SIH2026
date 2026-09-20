const { query } = require("../config/db");

/**
 * MySQL-backed User model
 */
const User = {
  async findByEmail(email) {
    const rows = await query("SELECT * FROM users WHERE email = ? LIMIT 1", [email.toLowerCase().trim()]);
    return rows[0] || null;
  },

  async findById(id) {
    const rows = await query("SELECT id, name, email, role, phone, avatar_url, is_active, last_login, created_at, updated_at FROM users WHERE id = ? LIMIT 1", [id]);
    return rows[0] || null;
  },

  async create({ id, name, email, password, role = "patient", phone = null, avatarUrl = null }) {
    await query(
      `INSERT INTO users (id, name, email, password, role, phone, avatar_url, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [id, name, email.toLowerCase().trim(), password, role, phone, avatarUrl]
    );
    return this.findById(id);
  },

  async updateLastLogin(id) {
    await query("UPDATE users SET last_login = NOW() WHERE id = ?", [id]);
  }
};

module.exports = User;