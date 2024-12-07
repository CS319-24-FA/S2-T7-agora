const { query } = require("../config/database");
const User = require("./User");
const UserModel = require("./UserModel");

class Coordinator extends User {
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

    // Coordinators have no extra logic beyond user creation.
    return { userId: newUser.id, password: this._originalPassword };
  }
}

module.exports = Coordinator;
