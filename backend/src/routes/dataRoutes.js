const express = require("express");
const router = express.Router();
const { getData, getYearlySchoolStudentData } = require("../controllers/dataController");

// Specific route first
router.get("/yearly/:year", getYearlySchoolStudentData); 
// General route after
router.get("/:filter/:periodIndex", getData); 

module.exports = router;
