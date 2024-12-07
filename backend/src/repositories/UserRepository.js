const UserModel = require("../models/UserModel");
const { query } = require("../config/database");

class UserRepository {
  async createUser(userData) {
    const user = await UserModel.create(userData);
    return user.id;
  }

  async findUserByEmail(email) {
    return await UserModel.findByEmail(email);
  }

  async deleteUserByEmail(email) {
    return await UserModel.deleteByEmail(email);
  }

  async updateUserPassword(email, hashedPassword) {
    const user = await UserModel.findByEmail(email);
    if (user) {
      await user.updatePassword(hashedPassword);
    }
  }

  async getAllUsers() {
    const result = await query("SELECT id, email FROM users");
    return result.rows.map((row) => new UserModel(row));
  }

  async getUserById(id) {
    return await UserModel.findById(id);
  }

  async updateResetToken(email, resetToken) {
    const user = await UserModel.findByEmail(email);
    if (user) {
      await user.updateResetToken(resetToken);
    }
  }

  async findUserByResetToken(token) {
    return await UserModel.findByResetToken(token);
  }

  async resetPassword(token, hashedPassword) {
    const user = await UserModel.findByResetToken(token);
    if (user) {
      await user.resetPassword(hashedPassword);
    }
  }
}

module.exports = new UserRepository();
