const { query } = require("../config/db");

/**
 * MySQL-backed Game model
 */
const Game = {
  async findAll({ activeOnly = true } = {}) {
    const sql = activeOnly
      ? "SELECT * FROM games WHERE is_active = TRUE ORDER BY title ASC"
      : "SELECT * FROM games ORDER BY title ASC";
    return query(sql);
  },

  async findById(id) {
    const rows = await query("SELECT * FROM games WHERE id = ? LIMIT 1", [id]);
    return rows[0] || null;
  }
};

module.exports = Game;