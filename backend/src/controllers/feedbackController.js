// feedbackController.js
const jwt = require("jsonwebtoken"); 
const JWT_SECRET = process.env.JWT_SECRET; 
const aws = require("aws-sdk");
const { query } = require("../config/database");
const { getFeedbackByRole, deleteFeedback, updateFeedback, createFeedback } = require("../queries/feedbackQueries");
const jwtUtils = require("../utils/jwt"); 

exports.validateToken = async (req, res) => {
  const { token } = req.query;

  try {
    jwt.verify(token, JWT_SECRET); // Use the verify method with your secret
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error validating token:", error.message);
    res.status(401).json({
      success: false,
      message: error.name === "TokenExpiredError" ? "Token has expired." : "Invalid token.",
    });
  }
};


exports.submitFeedback = async (req, res) => {
  const { token, feedback } = req.body;
  try {
    const decoded = jwtUtils.verifyToken(token);
    const { tourId, type } = decoded;

    if (type == "individual_tour") {
      const updateQuery = `
        UPDATE individual_tours
        SET feedback = $1
        WHERE id = $2
      `;
      await query(updateQuery, [feedback, tourId]);
    } else if (type == "tour") {
      const updateQuery = `
        UPDATE tours
        SET school_feedback = $1
        WHERE id = $2
      `;
      await query(updateQuery, [feedback, tourId]);
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid feedback type." });
    }

    res.json({ success: true, message: "Feedback submitted successfully." });
  } catch (err) {
    console.error("Error submitting feedback:", err.message || err);
    res
      .status(400)
      .json({ success: false, message: "Failed to submit feedback." });
  }
};

exports.getFeedbackByRole = async (req, res) => {
  try {
    const { userId, userType } = req.query;

    if (!userId || !userType) {
      return res.status(400).json({
        success: false,
        message: "User ID and User Type are required.",
      });
    }

    const feedback = await getFeedbackByRole(userId, userType);
    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    console.error("Error fetching feedback by role:", error);
    res.status(500).json({ success: false, message: "Failed to fetch feedback." });
  }
};

exports.createFeedback = async (req, res) => {
  try {
    const { user_ids, tour_id, text_feedback, sender_id, send_to_candidates } = req.body;
    
    if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User IDs (user_ids) must be a non-empty array.",
      });
    }
    if (!tour_id) {
      return res.status(400).json({
        success: false,
        message: "Tour ID is required.",
      });
    }
    if (!sender_id) {
      return res.status(400).json({
        success: false,
        message: "Sender ID is required.",
      });
    }

    const feedback = await createFeedback(
      user_ids,
      tour_id,
      text_feedback || null,
      sender_id,
      send_to_candidates
    );

    res.status(201).json({
      success: true,
      data: feedback,
      message: "Feedback created successfully.",
    });
  } catch (error) {
    console.error("Error creating feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create feedback.",
    });
  }
};

exports.updateFeedback = async (req, res) => {
  try {
    const { feedback_id, text_feedback, send_to_candidates, user_ids, tour_id, sender_id } = req.body;

    console.log("Received Payload:", req.body); // Log for debugging

    if (!feedback_id) {
      return res.status(400).json({ success: false, message: "Feedback ID is required." });
    }

    // Use UPDATE query to update the existing feedback
    const updateQuery = `
      UPDATE feedback
      SET 
        text_feedback = $1,
        send_to_candidates = $2,
        user_ids = $3,
        tour_id = $4,
        sender_id = $5
      WHERE id = $6
      RETURNING *
    `;

    const values = [
      text_feedback || null,       // New feedback text
      send_to_candidates || false, // Boolean flag
      user_ids,                    // Updated user IDs (array)
      tour_id,                     // Tour ID
      sender_id,                   // Sender ID
      feedback_id                  // The existing feedback ID to update
    ];

    const result = await query(updateQuery, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Feedback not found." });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: "Feedback updated successfully.",
    });
  } catch (error) {
    console.error("Error updating feedback:", error.message || error);
    res.status(500).json({ success: false, message: "Failed to update feedback." });
  }
};

exports.deleteFeedback = async (req, res) => {
  const { feedbackId } = req.params;

  if (!feedbackId) {
    return res.status(400).json({ success: false, message: "Feedback ID is required." });
  }

  try {
    await deleteFeedback(feedbackId); // Ensure this properly deletes the feedback
    res.status(200).json({ success: true, message: "Feedback deleted successfully." });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({ success: false, message: "Failed to delete feedback." });
  }
};


exports.getFeedbackByToken = async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwtUtils.verifyToken(token);
    const { tourId, type } = decoded;

    let feedbackQuery;
    if (type == "individual_tour") {
      feedbackQuery = `
        SELECT feedback AS text_feedback
        FROM individual_tours
        WHERE id = $1
      `;
    } else if (type == "tour") {
      feedbackQuery = `
        SELECT school_feedback AS text_feedback
        FROM tours
        WHERE id = $1
      `;
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Invalid feedback type." });
    }

    const result = await query(feedbackQuery, [tourId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found.",
      });
    }

    res.status(200).json({
      success: true,
      feedback: result.rows[0].text_feedback,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error.message || error);
    res
      .status(400)
      .json({ success: false, message: "Failed to fetch feedback." });
  }
};

exports.getUsersByIds = async (req, res) => {
  const { userIds } = req.body;

  if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "User IDs must be a non-empty array.",
    });
  }

  try {
    const queryText = 
      `SELECT id, first_name, last_name, user_type
      FROM users
      WHERE id = ANY($1)`
    ;

    const result = await query(queryText, [userIds]);

    res.status(200).json({
      success: true,
      data: result.rows, // Return all matching users with their roles
    });
  } catch (error) {
    console.error("Error fetching users by IDs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user details.",
    });
  }
};
