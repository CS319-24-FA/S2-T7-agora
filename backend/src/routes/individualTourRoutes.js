// routes/tourRoutes.js
const express = require("express");
const { getAllIndividualTours, approveTour, rejectTour, addIndividualTour } = require("../controllers/individualTourController");
const router = express.Router();

router.get("/getTours", getAllIndividualTours);
router.put("/approveTour/:tourId", approveTour);
router.put("/rejectTour/:tourId", rejectTour);
router.post("/addIndividualTour", addIndividualTour);

module.exports = router;
