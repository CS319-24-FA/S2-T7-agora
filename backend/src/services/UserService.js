const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/UserRepository");
const UserFactory = require("../factories/UserFactory");

class UserService {
  async createUser(userData) {
    // Create the user via the factory and save it.
    const user = UserFactory.createUser(userData);
    const { userId, password } = await user.save();
    return { userId, password };
  }

  async findUserByEmail(email) {
    return await userRepository.findUserByEmail(email);
  }

  async deleteUserByEmail(email) {
    return await userRepository.deleteUserByEmail(email);
  }

  async updateUserPassword(email, oldPassword, newPassword) {
    const user = await this.findUserByEmail(email);
    if (!user) {
      return null;
    }

    const isOldPasswordValid = await this.verifyPassword(
      oldPassword,
      user.password
    );
    if (!isOldPasswordValid) {
      return false;
    }

    const hashedNewPassword = await this.hashPassword(newPassword);
    await userRepository.updateUserPassword(email, hashedNewPassword);
    return true;
  }

  async getAllUsers() {
    return await userRepository.getAllUsers();
  }

  async getUserById(id) {
    return await userRepository.getUserById(id);
  }

  async requestPasswordReset(email) {
    const user = await this.findUserByEmail(email);
    if (!user) {
      return null;
    }

    const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    await userRepository.updateResetToken(email, resetToken);

    return resetToken;
  }

  async resetPassword(token, newPassword) {
    const user = await userRepository.findUserByResetToken(token);
    if (!user) {
      return false;
    }

    const hashedPassword = await this.hashPassword(newPassword);
    await userRepository.resetPassword(token, hashedPassword);

    return true;
  }

  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }
}

module.exports = new UserService();
