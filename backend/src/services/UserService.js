const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/UserRepository");
const pool = require("../config/database"); // Ensure the path to the database config is correct

class UserService {
  async createUser(userData) {
    const originalPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(originalPassword, 10);

    const roleToUserType = {
      "candidate guide": 1,
      guide: 2,
      advisor: 3,
      coordinator: 4,
    };

    const userType = roleToUserType[userData.role];
    const userId = await userRepository.createUser({
      ...userData,
      password: hashedPassword,
      userType,
    });

    await this._handleRoleSpecificLogic(userId, userData.role, userData);

    return { userId, password: originalPassword };
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

  async _handleRoleSpecificLogic(userId, role, userData) {
    if (role === "advisor") {
      await this._createAdvisor(userId, userData);
    } else if (role === "candidate guide") {
      await this._createCandidateGuide(userId, userData);
    }
  }

  async _createAdvisor(userId, { first_name, last_name, days }) {
    const fullName = `${first_name} ${last_name}`;
    await userRepository.createAdvisor(userId, fullName, days);
  }

  async _createCandidateGuide(
    userId,
    { first_name, last_name, department, advisor_name }
  ) {
    const advisor = await this.findAdvisorByName(advisor_name);
    if (!advisor) throw new Error("Advisor not found");

    const advisorUserId = advisor.user_id;
    const fullName = `${first_name} ${last_name}`;
    await userRepository.createCandidateGuide(
      userId,
      advisorUserId,
      advisor_name,
      fullName,
      department
    );
    await userRepository.updateAdvisorCandidateGuidesCount(advisorUserId);
  }

  async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  async findAdvisorByName(advisorName) {
    const result = await pool.query(
      "SELECT * FROM advisors WHERE full_name = $1",
      [advisorName]
    );
    return result.rows[0];
  }
}

module.exports = new UserService();
