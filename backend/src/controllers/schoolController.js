// src/controllers/schoolController.js

const {
  getAllSchools,
  getSchoolById,
  insertSchool,
  updateSchool: updateSchoolQuery,
  deleteSchool,
  getSchoolId,
} = require("../queries/schoolQueries");

const ss = require('simple-statistics');
const geolib = require('geolib');

// Static Weights Configuration
const WEIGHTS = {
  lgs: 0.45,      // Weight for LGS Score
  students: 0.20, // Weight for Students Sent
  pattern: 0.25,  // Weight for Strength Pattern
  city: 0.10      // Weight for City Score
};

const otherCityCoordinates = {
  "adana": { "latitude": 37.0000, "longitude": 35.3213 },
  "adıyaman": { "latitude": 37.7648, "longitude": 38.2786 },
  "afyonkarahisar": { "latitude": 38.7507, "longitude": 30.5567 },
  "ağrı": { "latitude": 39.7191, "longitude": 43.0503 },
  "aksaray": { "latitude": 38.3687, "longitude": 34.0360 },
  "amasya": { "latitude": 40.6499, "longitude": 35.8353 },
  "antalya": { "latitude": 36.8848, "longitude": 30.7040 },
  "ardahan": { "latitude": 41.1087, "longitude": 42.7022 },
  "artvin": { "latitude": 41.1828, "longitude": 41.8183 },
  "aydın": { "latitude": 37.8560, "longitude": 27.8416 },
  "balıkesir": { "latitude": 39.6484, "longitude": 27.8826 },
  "bartın": { "latitude": 41.6358, "longitude": 32.3375 },
  "batman": { "latitude": 37.8812, "longitude": 41.1351 },
  "bayburt": { "latitude": 40.2566, "longitude": 40.2220 },
  "bilecik": { "latitude": 40.0567, "longitude": 30.0665 },
  "bingöl": { "latitude": 39.0626, "longitude": 40.7696 },
  "bitlis": { "latitude": 38.3938, "longitude": 42.1232 },
  "bolu": { "latitude": 40.5760, "longitude": 31.5788 },
  "burdur": { "latitude": 37.4613, "longitude": 30.0665 },
  "bursa": { "latitude": 40.2669, "longitude": 29.0634 },
  "çanakkale": { "latitude": 40.1553, "longitude": 26.4142 },
  "çankırı": { "latitude": 40.6013, "longitude": 33.6134 },
  "çorum": { "latitude": 40.5506, "longitude": 34.9556 },
  "denizli": { "latitude": 37.7765, "longitude": 29.0864 },
  "diyarbakır": { "latitude": 37.9144, "longitude": 40.2306 },
  "düzce": { "latitude": 40.8389, "longitude": 31.1639 },
  "edirne": { "latitude": 41.6818, "longitude": 26.5623 },
  "elâzığ": { "latitude": 38.6810, "longitude": 39.2264 },
  "erzincan": { "latitude": 39.7500, "longitude": 39.5000 },
  "erzurum": { "latitude": 39.9000, "longitude": 41.2700 },
  "eskişehir": { "latitude": 39.7767, "longitude": 30.5206 },
  "gaziantep": { "latitude": 37.0662, "longitude": 37.3833 },
  "giresun": { "latitude": 40.9128, "longitude": 38.3895 },
  "gümüşhane": { "latitude": 40.4386, "longitude": 39.5086 },
  "hakkâri": { "latitude": 37.5833, "longitude": 43.7333 },
  "hatay": { "latitude": 36.4018, "longitude": 36.3498 },
  "ığdır": { "latitude": 39.8882, "longitude": 44.0048 },
  "ısparta": { "latitude": 37.7648, "longitude": 30.5566 },
  "istanbul": { "latitude": 41.0151, "longitude": 28.9795 },
  "izmir": { "latitude": 38.4237, "longitude": 27.1428 },
  "kahramanmaraş": { "latitude": 37.5753, "longitude": 36.9228 },
  "karabük": { "latitude": 41.2049, "longitude": 32.6277 },
  "karaman": { "latitude": 37.1813, "longitude": 33.2150 },
  "kars": { "latitude": 40.6167, "longitude": 43.1000 },
  "kastamonu": { "latitude": 41.3887, "longitude": 33.7827 },
  "kayseri": { "latitude": 38.7312, "longitude": 35.4787 },
  "kırıkkale": { "latitude": 39.8453, "longitude": 33.5064 },
  "kırklareli": { "latitude": 41.7333, "longitude": 27.2167 },
  "kırşehir": { "latitude": 39.1425, "longitude": 34.1709 },
  "kilis": { "latitude": 36.7184, "longitude": 37.1212 },
  "kocaeli": { "latitude": 40.8533, "longitude": 29.8815 },
  "konya": { "latitude": 37.8667, "longitude": 32.4833 },
  "kütahya": { "latitude": 39.4167, "longitude": 29.9833 },
  "malatya": { "latitude": 38.3552, "longitude": 38.3095 },
  "manisa": { "latitude": 38.6306, "longitude": 27.4222 },
  "mardin": { "latitude": 37.3212, "longitude": 40.7245 },
  "mersin": { "latitude": 36.8000, "longitude": 34.6333 },
  "muğla": { "latitude": 37.2153, "longitude": 28.3636 },
  "muş": { "latitude": 38.9462, "longitude": 41.7539 },
  "nevşehir": { "latitude": 38.6939, "longitude": 34.6857 },
  "niğde": { "latitude": 37.9667, "longitude": 34.6833 },
  "ordu": { "latitude": 40.9844, "longitude": 37.8762 },
  "osmaniye": { "latitude": 37.0748, "longitude": 36.2474 },
  "rize": { "latitude": 41.0201, "longitude": 40.5234 },
  "sakarya": { "latitude": 40.7647, "longitude": 30.4883 },
  "samsun": { "latitude": 41.2928, "longitude": 36.3312 },
  "siirt": { "latitude": 37.9333, "longitude": 41.9500 },
  "sinop": { "latitude": 42.0261, "longitude": 35.1536 },
  "sivas": { "latitude": 39.7477, "longitude": 37.0179 },
  "tekirdağ": { "latitude": 40.9783, "longitude": 27.5119 },
  "tokat": { "latitude": 40.3167, "longitude": 36.5500 },
  "trabzon": { "latitude": 41.0015, "longitude": 39.7178 },
  "tunceli": { "latitude": 39.3074, "longitude": 39.4388 },
  "şanlıurfa": { "latitude": 37.1591, "longitude": 38.7969 },
  "şırnak": { "latitude": 37.4187, "longitude": 42.4918 },
  "uşak": { "latitude": 38.6823, "longitude": 29.4082 },
  "van": { "latitude": 38.4942, "longitude": 43.3832 },
  "yalova": { "latitude": 40.6550, "longitude": 29.2769 },
  "yozgat": { "latitude": 39.8200, "longitude": 34.8147 },
  "zonguldak": { "latitude": 41.4564, "longitude": 31.7987 }
};

const ANKARA_COORDS = { latitude: 39.9334, longitude: 32.8597 };

const calculateDistanceFromAnkara = (city) => {
  const cityKey = city.trim().toLocaleLowerCase("tr-TR");
  if (!otherCityCoordinates[cityKey]) {
    // Default distance if city not found; you can set a default or fetch dynamically
    console.warn(`City "${cityKey}" not found in otherCityCoordinates. Assigning default distance of 0 km.`);
    return 0;
  }
  const distance = geolib.getDistance(ANKARA_COORDS, otherCityCoordinates[cityKey]);
  console.log(distance/1000);
  return distance / 1000; // Convert meters to kilometers
};

const assignCityScore = (distance) => {
  if (distance > 800) {
    return 90;
  } else if (distance > 650) {
    return 80;
  } else if (distance > 350) {
    return 60;
  } else if (distance > 150) {
    return 50;
  } else {
    return 30;
  }
};

// Function to calculate trend slope using linear regression
const calculateTrendSlope = (s1, s2, s3) => {
  const years = [1, 2, 3];
  const sends = [s1, s2, s3];
  const data = years.map((year, index) => [year, sends[index]]);
  const regression = ss.linearRegression(data);
  const slope = regression.m; // 'm' is the slope in y = mx + b

  return slope;
};

// Function to calculate weighted students sent with time decay
const calculateWeightedStudentsSent = (s1, s2, s3) => {
  const weights = {
    //EQUAL WEIGHTS
    lastYear: 0.33,   
    secondYear: 0.33,
    thirdYear: 0.33,  
  };
  const weightedTotal = (s1 * weights.lastYear) + (s2 * weights.secondYear) + (s3 * weights.thirdYear);
  return weightedTotal;
};

// Function to assign credit score based on specified criteria with static weighting
const credit_assign = async (schoolData) => {
  // Use static weights defined in WEIGHTS
  const weights = WEIGHTS;

  const {
    lgs_score,
    student_sent_last1,
    student_sent_last2,
    student_sent_last3,
    city,
  } = schoolData;

  // 1. Calculate LGS Score Component
  const lgsNormalized = Math.min(Math.max((lgs_score / 500) * 100, 0), 100);
  const lgsComponent = lgsNormalized * weights.lgs;

  // 2. Calculate Students Sent Component with Time Decay
  const weightedStudentsSent = calculateWeightedStudentsSent(student_sent_last1, student_sent_last2, student_sent_last3);
  let studentScore = 0;

  if (weightedStudentsSent >= 0 && weightedStudentsSent < 4) {
    studentScore = 100; // High Score
  } else if (weightedStudentsSent >= 4 && weightedStudentsSent < 8) {
    studentScore = 80; // Medium Score
  } else if (weightedStudentsSent >= 8 && weightedStudentsSent < 14) {
    studentScore = 60; // Low Score
  } else if (weightedStudentsSent >= 14) {
    studentScore = 40; // Very Low Score
  }

  const studentComponent = studentScore * weights.students;

  // 3. Calculate Strength Pattern Component
  const slope = calculateTrendSlope(student_sent_last3, student_sent_last2, student_sent_last1);
  let patternScore = 0;

  if (slope <= -2) {
    // Strongly Decreasing
    patternScore = 100;
  } else if (slope < 0) {
    // Weakly Decreasing
    patternScore = 80;
  } else if (Math.abs(slope) < 0.5) {
    // Stable
    patternScore = 60;
  } else if (slope < 2) {
    // Weakly Increasing
    patternScore = 40;
  } else {
    // Strongly Increasing
    patternScore = 20;
  }

  const patternComponent = patternScore * weights.pattern;

  // 4. Calculate City Component Based on Distance
  const distance = calculateDistanceFromAnkara(city);
  const cityScore = assignCityScore(distance);
  const cityComponent = cityScore * weights.city;

  // 5. Total Credit Score
  let totalCreditScore = lgsComponent + studentComponent + patternComponent + cityComponent;

  // Ensure the score is within 0-100
  totalCreditScore = Math.min(Math.max(totalCreditScore, 0), 100);

  // Optional: Log the components for transparency
  console.log(`Calculating credit score for ${schoolData.school_name}:`);
  console.log(`LGS Component (${weights.lgs.toFixed(2)}): ${lgsComponent}`);
  console.log(`Students Component (${weights.students.toFixed(2)}): ${studentComponent}`);
  console.log(`Pattern Component (${weights.pattern.toFixed(2)}): ${patternComponent}`);
  console.log(`City Component (${weights.city.toFixed(2)}): ${cityComponent}`);
  console.log(`Total Credit Score: ${totalCreditScore}`);

  return parseFloat(totalCreditScore.toFixed(2)); // Rounded to 2 decimal places
};

// Add a new school
exports.addSchool = async (req, res) => {
  const {
    school_name,
    city,
    academic_year_start,
    academic_year_end,
    student_count,
    student_sent_last1,
    student_sent_last2,
    student_sent_last3,
    lgs_score,
  } = req.body;

  try {
    // Check for duplicate schools based on school name, city, and academic year start
    const existingId = await getSchoolId(school_name, city, academic_year_start);

    if (existingId) {
      return res.status(400).json({
        success: false,
        message: "School already exists for the specified academic year",
      });
    }

    // Assign a credit_score based on the algorithm
    const credit_score = await credit_assign({
      school_name,
      lgs_score,
      student_sent_last1,
      student_sent_last2,
      student_sent_last3,
      city,
    });

    // Prepare school data with credit_score
    const schoolData = {
      school_name,
      city,
      academic_year_start,
      academic_year_end,
      student_count,
      student_sent_last1,
      student_sent_last2,
      student_sent_last3,
      lgs_score,
      credit_score, // Include credit_score
    };

    // Insert the school into the database
    const schoolId = await insertSchool(schoolData);

    res.status(201).json({
      success: true,
      message: "School added successfully",
      schoolId,
      credit_score, // Return the credit_score for verification
    });
  } catch (error) {
    console.error("Error adding school:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Retrieve all schools
exports.getAllSchools = async (req, res) => {
  try {
    const schools = await getAllSchools();

    res.status(200).json({
      success: true,
      data: schools,
    });
  } catch (error) {
    console.error("Error retrieving schools:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Retrieve a single school by ID
exports.getSchoolById = async (req, res) => {
  const { id } = req.params;

  try {
    const school = await getSchoolById(id);

    if (!school) {
      return res.status(404).json({ success: false, message: "School not found" });
    }

    res.status(200).json({
      success: true,
      data: school,
    });
  } catch (error) {
    console.error("Error retrieving school:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update a school by ID
exports.updateSchool = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    // Check if the school exists
    const existingSchool = await getSchoolById(id);

    if (!existingSchool) {
      return res.status(404).json({ success: false, message: "School not found" });
    }

    // Merge existing data with updateData to ensure all fields are present for credit_assign
    const mergedData = {
      ...existingSchool,
      ...updateData,
    };

    // Assign a new credit_score based on the updated data
    const credit_score = credit_assign({
      lgs_score: mergedData.lgs_score,
      student_sent_last1: mergedData.student_sent_last1,
      student_sent_last2: mergedData.student_sent_last2,
      student_sent_last3: mergedData.student_sent_last3,
      city: mergedData.city,
    });

    // Prepare update data with the new credit_score
    const updatedSchoolData = {
      ...updateData,
      credit_score, // Include the recalculated credit_score
    };

    // Update the school in the database
    const updatedSchool = await updateSchoolQuery(id, updatedSchoolData);

    res.status(200).json({
      success: true,
      message: "School updated successfully",
      data: updatedSchool,
      credit_score, // Optionally return the updated credit_score
    });
  } catch (error) {
    console.error("Error updating school:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete a school by ID
exports.deleteSchool = async (req, res) => {
  const { id } = req.params;

  try {
    // Check if the school exists
    const existingSchool = await getSchoolById(id);

    if (!existingSchool) {
      return res.status(404).json({ success: false, message: "School not found" });
    }

    // Delete the school from the database
    await deleteSchool(id);

    res.status(200).json({
      success: true,
      message: "School deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting school:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
