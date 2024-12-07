const express = require("express");
const { addTour,

    getReadyTours,
    countAssignedGuides,
    assignGuideToTour,
    assignCandidateGuidesToTour,
    getCandidateGuides,
    getAllTours,
    approveTour,
    rejectTour,
    updateClassroom,
    updateTime,
    getMyTours,
    withdrawFromTour,
    cancelTour,
    fetchDoneTours,
    getToursByUserId,
    getUsersByTourId
} = require("../controllers/tourController");
const authenticateToken = require('../middleware/auth'); // Middleware for authentication

const router = express.Router();

router.post("/addTour", addTour);
router.get("/readyTours", getReadyTours);
router.get("/:tour_id/guideCount", countAssignedGuides);
router.post("/assignGuide", assignGuideToTour);
router.post("/assignCandidate", assignCandidateGuidesToTour);
router.get("/candidateGuides", getCandidateGuides);
router.get("/allTours", getAllTours);
router.put("/approve/:id", approveTour);
router.put("/reject/:id", rejectTour);
router.put("/:id/updateClassroom", updateClassroom);
router.put("/updateTime/:id", updateTime);
router.get("/myTours", authenticateToken, getMyTours); // Ensure `authenticateUser` middleware is implemented
router.delete("/withdraw/:id", authenticateToken, withdrawFromTour);
router.get("/doneTours", fetchDoneTours);
router.get("/cancel", cancelTour);
router.get("/getToursByUser", getToursByUserId);
router.get("/getUsersByTour", getUsersByTourId);
module.exports = router;
