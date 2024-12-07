const express = require("express");
const multer = require("multer");
const feedbackController = require("../controllers/feedbackController");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/paginated", feedbackController.getFeedbackWithPagination);
router.post("/upload", upload.single("file"), feedbackController.uploadFeedback);
router.get("/:feedbackId/download", feedbackController.getFeedbackDownloadLink);
router.delete("/:feedbackId", feedbackController.deleteFeedback);
router.post("/createFeedback", feedbackController.createFeedback);

module.exports = router;
