const { query } = require("../config/database");

class UserModel {
  constructor(userData) {
    this.id = userData.id;
    this.first_name = userData.first_name;
    this.last_name = userData.last_name;
    this.email = userData.email;
    this.password = userData.password;
    this.department = userData.department;
    this.role = userData.role;
    this.phone_number = userData.phone_number;
    this.crew_no = userData.crew_no;
    this.user_type = userData.user_type;
    this.reset_token = userData.reset_token;
    this.reset_token_expires = userData.reset_token_expires;
  }

  static async create(userData) {
    const {
      first_name,
      last_name,
      email,
      hashedPassword,
      department,
      role,
      phone_number,
      crew_no,
      userType,
    } = userData;

    const result = await query(
      `INSERT INTO users (first_name, last_name, email, password, department, role, phone_number, crew_no, user_type) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [
        first_name,
        last_name,
        email,
        hashedPassword,
        department,
        role,
        phone_number,
        crew_no || null,
        userType,
      ]
    );

    return new UserModel(result.rows[0]);
  }

  static async findByEmail(email) {
    const result = await query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows[0]) {
      return new UserModel(result.rows[0]);
    }
    return null;
  }

  static async findById(id) {
    const result = await query("SELECT * FROM users WHERE id = $1", [id]);
    if (result.rows[0]) {
      return new UserModel(result.rows[0]);
    }
    return null;
  }

  static async deleteByEmail(email) {
    const result = await query(
      "DELETE FROM users WHERE email = $1 RETURNING id, email",
      [email]
    );
    if (result.rows[0]) {
      return new UserModel(result.rows[0]);
    }
    return null;
  }

  async updatePassword(hashedPassword) {
    await query("UPDATE users SET password = $1 WHERE email = $2", [
      hashedPassword,
      this.email,
    ]);
  }

  async updateResetToken(resetToken) {
    await query(
      "UPDATE users SET reset_token = $1, reset_token_expires = NOW() + interval '1 hour' WHERE email = $2",
      [resetToken, this.email]
    );
  }

  static async findByResetToken(token) {
    const result = await query(
      "SELECT * FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()",
      [token]
    );
    if (result.rows[0]) {
      return new UserModel(result.rows[0]);
    }
    return null;
  }

  async resetPassword(hashedPassword) {
    await query(
      "UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE reset_token = $2",
      [hashedPassword, this.reset_token]
    );
  }
}

module.exports = UserModel;
