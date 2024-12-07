const aws = require("aws-sdk");
const { getPaginatedFeedback, addFeedback, deleteFeedback, createFeedback } = require("../queries/feedbackQueries");

exports.getFeedbackWithPagination = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 50;
  const offset = (page - 1) * limit;

  try {
    const feedback = await getPaginatedFeedback(limit, offset);
    res.status(200).json({
      success: true,
      page,
      limit,
      data: feedback,
    });
  } catch (error) {
    console.error("Error fetching feedback:", error.message || error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.uploadFeedback = async (req, res) => {
  const { tourId } = req.body;
  const userId = req.user.id;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const s3Params = {
      Bucket: process.env.BUCKET_NAME,
      Key: `feedback/${Date.now()}_${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const s3Response = await s3.upload(s3Params).promise();

    const result = await addFeedback(
      file.originalname,
      file.mimetype,
      file.size,
      s3Response.Location,
      userId,
      tourId
    );

    res.status(201).json({
      success: true,
      message: "Feedback uploaded successfully",
      feedbackId: result.rows[0].id,
    });
  } catch (error) {
    console.error("Error uploading feedback:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getFeedbackDownloadLink = async (req, res) => {
  const { feedbackId } = req.params;

  try {
    const sql = `SELECT s3_url FROM feedback WHERE id = $1`;
    const result = await query(sql, [feedbackId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    const s3Url = result.rows[0].s3_url;
    const fileKey = new URL(s3Url).pathname.substring(1);
    const s3Params = {
      Bucket: process.env.BUCKET_NAME,
      Key: fileKey,
      Expires: 300,
    };

    const presignedUrl = await s3.getSignedUrlPromise("getObject", s3Params);
    res.status(200).json({ url: presignedUrl });
  } catch (error) {
    console.error("Error generating download link:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteFeedback = async (req, res) => {
  const { feedbackId } = req.params;

  try {
    const result = await deleteFeedback(feedbackId);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    const s3Url = result.rows[0].s3_url;
    const fileKey = new URL(s3Url).pathname.substring(1);

    await s3.deleteObject({ Bucket: process.env.BUCKET_NAME, Key: fileKey }).promise();
    res.status(200).json({ success: true, message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Error deleting feedback:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.createFeedback = async (req, res) => {
  try {
    const { user_ids, tour_id, text_feedback, sender_id } = req.body; // Extract `user_ids`, `tour_id`, `text_feedback`, and `sender_id`

    // Validate input
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

    // Call query to insert feedback
    const feedback = await createFeedback(user_ids, tour_id, text_feedback || null, sender_id);

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


