const CandidateGuide = require("../models/CandidateGuide");
const Guide = require("../models/Guide");
const Advisor = require("../models/Advisor");
const Coordinator = require("../models/Coordinator");

class UserFactory {
  createUser(userData) {
    switch (userData.role.toLowerCase()) {
      case "candidate guide":
        return new CandidateGuide(userData);
      case "guide":
        return new Guide(userData);
      case "advisor":
        return new Advisor(userData);
      case "coordinator":
        return new Coordinator(userData);
      default:
        throw new Error(`Invalid user role: ${userData.role}`);
    }
  }
}

module.exports = new UserFactory();
