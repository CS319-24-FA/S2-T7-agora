const { query } = require("../config/database");
const User = require("./User");
const UserModel = require("./UserModel");

class Advisor extends User {
  constructor(userData) {
    super(userData);
    this.days = userData.days;
  }

  async save() {
    const hashedPassword = await this._generatePassword();
    const newUser = await UserModel.create({
      first_name: this.firstName,
      last_name: this.lastName,
      email: this.email,
      hashedPassword,
      department: this.department,
      role: this.role,
      phone_number: this.phoneNumber,
      crew_no: this.crewNo,
      userType: this.userType,
    });

    await query(
      `INSERT INTO advisors (user_id, full_name, day, candidate_guides_count, created_at, updated_at) 
       VALUES ($1, $2, $3, 0, NOW(), NOW())`,
      [newUser.id, `${this.firstName} ${this.lastName}`, this.days]
    );

    return { userId: newUser.id, password: this._originalPassword };
  }
}

module.exports = Advisor;
