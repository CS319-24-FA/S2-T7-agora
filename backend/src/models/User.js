const bcrypt = require("bcrypt");

class User {
  constructor(userData) {
    this.firstName = userData.first_name;
    this.lastName = userData.last_name;
    this.email = userData.email;
    this.department = userData.department || null;
    this.role = userData.role;
    this.phoneNumber = userData.phone_number || null;
    this.crewNo = userData.crew_no || null;
    this.userType = this._mapRoleToUserType(this.role);
    this._originalPassword = null;
  }

  _mapRoleToUserType(role) {
    const roleMap = {
      "candidate guide": 1,
      guide: 2,
      advisor: 3,
      coordinator: 4,
    };
    return roleMap[role.toLowerCase()] || null;
  }

  async _generatePassword() {
    this._originalPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(this._originalPassword, 10);
    return hashedPassword;
  }

  // Subclasses implement their own save method.
  async save() {
    throw new Error("Subclasses must implement the save() method.");
  }
}

module.exports = User;
