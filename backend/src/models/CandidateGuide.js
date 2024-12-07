const { query } = require("../config/database");
const User = require("./User");
const UserModel = require("./UserModel");

class CandidateGuide extends User {
  constructor(userData) {
    super(userData);
    this.advisorName = userData.advisor_name;
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

    const advisor = await query(`SELECT * FROM advisors WHERE full_name = $1`, [
      this.advisorName,
    ]);
    if (!advisor.rows[0]) throw new Error("Advisor not found");

    const advisorUserId = advisor.rows[0].user_id;

    await query(
      `INSERT INTO candidate_guides (user_id, advisor_user_id, advisor_name, full_name, department, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [
        newUser.id,
        advisorUserId,
        this.advisorName,
        `${this.firstName} ${this.lastName}`,
        this.department,
      ]
    );

    await query(
      `UPDATE advisors SET candidate_guides_count = candidate_guides_count + 1 WHERE user_id = $1`,
      [advisorUserId]
    );

    return { userId: newUser.id, password: this._originalPassword };
  }
}

module.exports = CandidateGuide;
