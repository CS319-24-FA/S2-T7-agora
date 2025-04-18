// src/controllers/tourController.js
const {
  doesTourExist,
  insertTour,
  insertTourTimes,
  fetchTourDetails,
  isUserAssignedToTour,
  hasSchedulingConflict,
  fetchAssignmentCounts,
  validateQuota,
  fetchCandidateGuides,
  isGuideAssignedToTour,
  getAssignedGuideCount,
  getGuideCountForTour,
  getReadyTours,
  getAllTours,
  approveTour,
  rejectTour,
  updateTime,
  updateClassroom,
  getDoneTours
} = require("../queries/tourQueries");

const { getSchoolId } = require("../queries/schoolQueries"); // Import from school queries
const { sendConfirmationEmail } = require('../utils/email'); // Import the function
const { query } = require("../config/database");
const { verifyToken, generateCancellationToken } = require("../utils/jwt");
const { checkAndSetToursReady } = require('../jobs/tourStatusJob');

require("dotenv").config(); // At the top of your entry file (e.g., server.js or app.js)

const FRONTEND_URL = process.env.FRONTEND_URL;

const { sendEmail } = require("../utils/email");
// src/controllers/tourController.js

exports.addTour = async (req, res) => {
  const {
    school_name,
    city,
    academic_year_start,
    date,
    tour_size,
    teacher_name,
    teacher_phone,
    teacher_email,
    time_preferences,
    visitor_notes,
  } = req.body;

  try {
    const school_id = await getSchoolId(school_name, city, academic_year_start);
    if (!school_id) {
      return res.status(400).json({ message: "School not found" });
    }

    const tourExists = await doesTourExist(school_id, date);
    if (tourExists) {
      return res.status(400).json({ message: "A tour already exists for this school on the given date" });
    }

    const day = new Date(date).toLocaleString("en-GB", { weekday: "long" });
    const guide_count = Math.ceil(tour_size / 60);

    const tourId = await insertTour({
      school_id,
      date,
      day: day.charAt(0).toUpperCase() + day.slice(1),
      tour_size,
      guide_count,
      teacher_name,
      teacher_phone,
      teacher_email,
      visitor_notes,
    });

    if (time_preferences && time_preferences.length > 0) {
      await insertTourTimes(tourId, time_preferences);
    } else {
      return res.status(400).json({ message: "At least one time preference is required." });
    }

    await sendConfirmationEmail(teacher_email, {
      teacher_name,
      tour_date: date,
      school_name,
      time_preferences,
    });

    await checkAndSetToursReady();

    res.status(200).json({
      success: true,
      message: "Tour and time preferences added successfully",
      tourId,
    });
  } catch (error) {
    console.error("Error adding tour:", error.message || error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.assignGuideToTour = async (req, res) => {
  const { school_name, city, date, time, user_id, user_type } = req.body;

  try {
    const { id: tour_id, guide_count } = await fetchTourDetails(
      school_name,
      city,
      date,
      time
    );

    if (await isUserAssignedToTour(tour_id, user_id)) {
      return res.status(400).json({
        success: false,
        message: "Guide is already assigned to this tour!",
      });
    }

    if (await hasSchedulingConflict(user_id, date, time)) {
      return res.status(400).json({
        success: false,
        message: "Guide is already assigned to another tour at the same time!",
      });
    }

    const { assigned_guides, guide_names } = await fetchAssignmentCounts(tour_id);
    validateQuota(assigned_guides, 1, guide_count, "guide");

    await query("INSERT INTO tour_guide (tour_id, guide_id) VALUES ($1, $2)", [
      tour_id,
      user_id,
    ]);
    const guide = await query(
      "SELECT first_name, last_name FROM users WHERE id = $1",
      [user_id]
    );
    const guideName = guide.rows[0].first_name + " " + guide.rows[0].last_name;

    const updatedGuideNames = guide_names ? `${guide_names}, ${guideName}` : guideName;

    // Emit the WebSocket event with updated guide names and count
    const io = req.app.get("io");
    io.emit("guideAssigned", {
      tourId: tour_id,
      guide_names: updatedGuideNames,
      assignedGuides: assigned_guides + 1,
    });

    res.status(200).json({
      success: true,
      message: "Guide successfully assigned to the tour!",
    });
  } catch (error) {
    console.error("Error assigning guide:", error.message || error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.assignCandidateGuidesToTour = async (req, res) => {
  const { school_name, city, date, time, user_ids } = req.body;
  console.log("User IDs received:", user_ids); // Log incoming user IDs

  try {
    const { id: tour_id, guide_count } = await fetchTourDetails(school_name, city, date, time);
    const { assigned_candidates, candidate_names } = await fetchAssignmentCounts(tour_id);
    console.log("Fetched assigned candidates before insert:", assigned_candidates);

    const newAssignments = [];
    const unassignableCandidates = [];

    for (const user_id of user_ids) {
      if (await isUserAssignedToTour(tour_id, user_id)) {
        unassignableCandidates.push({ user_id, reason: "Already assigned to the tour" });
      } else if (await hasSchedulingConflict(user_id, date, time)) {
        unassignableCandidates.push({ user_id, reason: "Has a scheduling conflict" });
      } else {
        newAssignments.push(user_id);
      }
    }

    console.log("Newassignment length: " + newAssignments.length);

    validateQuota(assigned_candidates, newAssignments.length, guide_count, "candidate");

    if (newAssignments.length > 0) {
      const bulkInsertValues = newAssignments
        .map((user_id) => `(${tour_id}, ${user_id})`)
        .join(", ");
      await query(`INSERT INTO tour_guide (tour_id, guide_id) VALUES ${bulkInsertValues}`);
    }

    const candidateNames = await Promise.all(
      newAssignments.map(async (user_id) => {
        const user = await query(
          "SELECT first_name, last_name FROM users WHERE id = $1",
          [user_id]
        );
        return `${user.rows[0].first_name} ${user.rows[0].last_name}`;
      })
    );

    const updatedCandidateNames = candidate_names
      ? `${candidate_names}, ${candidateNames.join(", ")}`
      : candidateNames.join(", ");

    const updatedCount = assigned_candidates + newAssignments.length;
    const io = req.app.get("io");
    io.emit("candidateAssigned", {
      tourId: tour_id,
      candidate_names: updatedCandidateNames,
      assignedCandidates: updatedCount,
    });

    const responseMessage = newAssignments.length > 0
      ? "Candidate guide(s) successfully assigned to the tour!"
      : null;

    const warningMessage = unassignableCandidates.length > 0
      ? "Some candidate(s) could not be assigned due to conflicts."
      : null;

    res.status(200).json({
      success: true,
      message: responseMessage,
      warning: warningMessage,
      assignedUsers: newAssignments,
      unassignableCandidates,
    });
  } catch (error) {
    console.error("Error assigning candidate guides:", error.message || error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.countAssignedGuides = async (req, res) => {
  const { tour_id } = req.params;

  try {
    const guideCount = await getAssignedGuideCount(tour_id);

    res.status(200).json({
      success: true,
      guide_count: guideCount,
    });
  } catch (error) {
    console.error("Error counting assigned guides:", error.message || error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getReadyTours = async (req, res) => {
  try {
    const tours = await getReadyTours();
    res.status(200).json({
      success: true,
      data: tours,
    });
  } catch (error) {
    console.error("Error fetching READY tours:", error.message || error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.getCandidateGuides = async (req, res) => {
  try {
    const { tourId } = req.query;

    if (!tourId) {
      return res.status(400).json({ message: "Tour ID is required" });
    }

    const candidates = await query(
      `
      SELECT 
        u.id, 
        CONCAT(u.first_name, ' ', u.last_name) AS name
      FROM users u
      JOIN tour_requests tr ON u.id = tr.guide_id
      WHERE tr.tour_id = $1
      `,
      [tourId]
    );

    res.status(200).json({ tourId, candidates: candidates.rows });
  } catch (error) {
    console.error("Error fetching candidate guides:", error);
    res.status(500).json({ message: "Failed to fetch candidate guides" });
  }
};

exports.getAllTours = async (req, res) => {
  try {
    const tours = await getAllTours();
    res.status(200).json({
      success: true,
      data: tours,
    });
  } catch (error) {
    console.error("Error fetching all tours:", error.message || error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.approveTour = async (req, res) => {
  const { id } = req.params;
  const { selectedTime, tourDate } = req.body; // Include selectedTime and tourDate in the request

  if (!selectedTime || !tourDate) {
    return res.status(400).json({ message: "Time preference and tour date are required" });
  }

  try {
    // Fetch the teacher_email and teacher_name from the database
    const fetchQuery = `SELECT teacher_email, teacher_name FROM tours WHERE id = $1`;
    const fetchResult = await query(fetchQuery, [id]);

    if (fetchResult.rows.length === 0) {
      return res.status(404).json({ message: "Tour not found" });
    }

    const { teacher_email, teacher_name } = fetchResult.rows[0];

    if (!teacher_email) {
      return res.status(400).json({ message: "Teacher email not found for this tour" });
    }

    // Update the tour status and selected time in the database
    const updateQuery = `
      UPDATE tours 
      SET time = $1, tour_status = 'APPROVED'
      WHERE id = $2
    `;
    await query(updateQuery, [selectedTime, id]);

    // Generate the cancellation token
    const cancellationToken = generateCancellationToken(id, tourDate, "tour");

    // Construct the cancellation link
    const FRONTEND_URL = process.env.FRONTEND_URL;
    const cancellationLink = `${FRONTEND_URL}/tours/cancel?token=${cancellationToken}`;

    // Send email with cancellation link
    const emailContent = `
      <p>Dear ${teacher_name || "Applicant"},</p>
      <p>Your tour has been approved for the time: <b>${selectedTime}</b>.</p>
      <p>If you wish to cancel, click the link below:</p>
      <a href="${cancellationLink}">Cancel My Tour</a>
    `;

    await sendEmail({
      to: teacher_email, // Use the teacher_email from the database
      subject: "Tour Approved",
      html: emailContent,
    });

    await checkAndSetToursReady();

    res.status(200).json({ message: "Tour approved, status updated, and email sent" });
  } catch (error) {
    console.error("Error approving tour:", error);
    res.status(500).json({ message: "Failed to approve tour" });
  }
};


// Controller to reject a tour
exports.rejectTour = async (req, res) => {
  const { id } = req.params;

  try {
    // Update the tour in the database
    const tour = await rejectTour(id); // Ensure this query returns teacher_email and other relevant fields

    // Send an email to the teacher
    const emailContent = `
      <p>Dear ${tour.teacher_name},</p>
      <p>We regret to inform you that your tour request has been rejected.</p>
      <p>If you have any questions, please feel free to contact us.</p>
      <p>Best regards,<br/>BTO Core Team</p>
    `;

    await sendEmail({
      to: tour.teacher_email,
      subject: "Tour Rejected",
      html: emailContent,
    });

    res.status(200).json({ message: "Tour rejected and email sent" });
  } catch (error) {
    console.error("Error rejecting tour:", error);
    res.status(500).json({ message: "Failed to reject tour" });
  }
};

exports.cancelTour = async (req, res) => {
  const { token } = req.query;

  try {
    // Step 1: Verify the token
    const decoded = verifyToken(token);
    const { tourId, type } = decoded;

    if (!tourId || !type) {
      return res.status(400).json({ message: "Invalid cancellation token." });
    }

    // Determine the table and columns based on the type
    let tableName, statusColumn, dateColumn, dayColumn;
    switch (type) {
      case "tour":
        tableName = "tours";
        statusColumn = "tour_status";
        dateColumn = "date";
        dayColumn = "day";
        break;
      case "individual_tour":
        tableName = "individual_tours";
        statusColumn = "tour_status";
        dateColumn = "date";
        dayColumn = "day";
        break;
      default:
        return res.status(400).json({ message: "Invalid type in cancellation token." });
    }

    // Step 2: Check if the cancellation token has already been used
    const selectQuery = `
      SELECT cancellation_used, ${dateColumn}, ${dayColumn || "NULL"} AS day
      FROM "${tableName}"
      WHERE id = $1
    `;
    const result = await query(selectQuery, [tourId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: `${type} not found.` });
    }

    const { cancellation_used, date, day } = result.rows[0];

    if (cancellation_used) {
      return res.status(400).json({ message: "This cancellation link has already been used." });
    }

    // Step 3: Cancel the tour or individual tour
    const updateQuery = `
      UPDATE "${tableName}"
      SET "${statusColumn}" = $1, "cancellation_used" = TRUE
      WHERE id = $2
    `;
    await query(updateQuery, ["CANCELLED", tourId]);

    // Step 4: Fetch assigned guides and send emails
    let guideIds = [];

    // If type is individual_tour, fetch guide_id directly from the individual_tours table
    if (type === "individual_tour") {
      const guideQuery = `
    SELECT guide_id
    FROM individual_tours
    WHERE id = $1
  `;
      const guideResult = await query(guideQuery, [tourId]);

      if (guideResult.rows.length > 0 && guideResult.rows[0].guide_id) {
        guideIds = [guideResult.rows[0].guide_id]; // Store the guide_id in an array for consistency
      }
    } else {
      // For tours, fetch guide IDs from the tour_guide table
      const guideIdsResult = await query(
        'SELECT guide_id FROM "tour_guide" WHERE "tour_id" = $1',
        [tourId]
      );
      guideIds = guideIdsResult.rows.map((row) => row.guide_id);
    }


    if (guideIds.length > 0) {
      const userResult = await query(
        'SELECT email FROM "users" WHERE id = ANY($1::int[])',
        [guideIds]
      );
      const emails = userResult.rows.map((row) => row.email).filter((email) => !!email);

      if (emails.length > 0) {
        const subject = `${type === "individual_tour" ? "Individual Tour" : "Tour"} Cancelled`;
        const formattedDate = new Date(date).toLocaleDateString("en-GB", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const html = `
          <p>Dear Guide,</p>
          <p>We regret to inform you that the following ${type === "individual_tour" ? "individual tour" : "tour"} has been cancelled:</p>
          <p><strong>Date:</strong> ${formattedDate} ${day ? `(${day})` : ""}</p>
          <p>We apologize for any inconvenience caused. If you have any questions, please contact us.</p>
          <p>Best regards,<br/><strong>BTO Core Team</strong></p>
        `;

        try {
          await sendEmail({
            to: emails.join(","),
            subject,
            html,
          });
          console.log("Cancellation emails sent to assigned guides.");
        } catch (emailError) {
          console.error("Failed to send cancellation emails:", emailError);
        }
      } else {
        console.log("No emails found for assigned guides.");
      }
    } else {
      console.log("No guides assigned to this tour.");
    }

    // Optional: Trigger additional updates for tours
    /*if (type === "tour") {
      await checkAndSetToursReady();
    }*/

    res.status(200).send(`<h1>${type.charAt(0).toUpperCase() + type.slice(1)} successfully canceled.</h1>`);
  } catch (error) {
    console.error("Error canceling:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Cancellation token has expired." });
    }

    res.status(500).json({ message: "Failed to cancel the entity." });
  }
};

exports.updateClassroom = async (req, res) => {
  const { id } = req.params;
  const { classroom } = req.body;

  if (!classroom) {
    return res.status(400).json({ message: "Classroom is required" });
  }

  try {
    await updateClassroom(id, classroom);
    res.status(200).json({ message: "Classroom updated successfully" });
  } catch (error) {
    console.error("Error updating classroom:", error.message || error);
    res.status(500).json({
      success: false,
      message: "Failed to update classroom",
    });
  }
};

exports.updateTime = async (req, res) => {
  const { id } = req.params; // Tour ID
  const { selectedTime } = req.body; // New time value

  if (!selectedTime) {
    return res.status(400).json({ message: "Time preference is required." });
  }

  try {
    await updateTime(id, selectedTime); // Call the query method
    res.status(200).json({ message: "Time updated successfully." });
  } catch (error) {
    console.error("Error updating time:", error.message || error);
    res.status(500).json({
      success: false,
      message: "Failed to update time.",
    });
  }
};

exports.getMyTours = async (req, res) => {
  const userId = req.user.userId; // Assuming you are using an authentication middleware that sets req.user
  try {
    console.log("Logged-in user ID:", userId); // Debug the user ID

    const result = await query(
      `
          SELECT t.id, t.date, t.day, t.time, t.classroom, t.tour_status,
                 s.school_name, s.city, t.tour_size, t.teacher_name,
                 STRING_AGG(u.first_name || ' ' || u.last_name, ', ') AS guide_names
          FROM tours t
          JOIN schools s ON t.school_id = s.id
          JOIN tour_guide tg ON t.id = tg.tour_id
          LEFT JOIN users u ON tg.guide_id = u.id
          WHERE tg.guide_id = $1 AND t.tour_status = 'READY'
          GROUP BY t.id, s.school_name, s.city, t.tour_size, t.teacher_name
          ORDER BY t.date, t.time
          `,
      [userId]
    );
    res.status(200).json({ success: true, tours: result.rows });
  } catch (error) {
    console.error("Error fetching user tours:", error.message || error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.withdrawFromTour = async (req, res) => {
  const userId = req.user.userId; // Retrieve user ID from the authentication token
  const { id: tourId } = req.params; // Retrieve tour ID from the route parameter

  try {
    // 1. Remove the user from the tour
    await query(
      `DELETE FROM tour_guide WHERE guide_id = $1 AND tour_id = $2`,
      [userId, tourId]
    );

    // 2. Fetch the withdrawing user's first_name and last_name
    const userResult = await query(
      `SELECT first_name, last_name FROM users WHERE id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      console.error("Withdrawing user not found in the database");
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const { first_name, last_name } = userResult.rows[0];

    // 3. Fetch admins (user_type = 4)
    const adminsResult = await query(
      `SELECT email FROM users WHERE user_type = 4 AND email IS NOT NULL`
    );

    const adminEmails = adminsResult.rows.map(row => row.email).filter(e => e);

    // If no admin emails found, we still proceed, but no emails will be sent
    if (adminEmails.length === 0) {
      console.log("No admin found with user_type = 4 or no email set.");
    }

    // 4. Fetch more information about the tour and associated school
    // Assume 'tours' table has columns: date, day, time, tour_size, teacher_name, tour_status, school_id
    // and 'schools' table has 'school_name'
    const tourQuery = `
      SELECT 
        t.date, t.day, t.time, t.tour_size, t.teacher_name, t.tour_status, s.school_name
      FROM tours t
      JOIN schools s ON t.school_id = s.id
      WHERE t.id = $1
    `;
    const tourResult = await query(tourQuery, [tourId]);

    if (tourResult.rows.length === 0) {
      console.error("Tour not found in the database");
      // Tour doesn't exist, but the withdrawal is done anyway
      return res.status(200).json({ success: true, message: "Successfully withdrawn from the tour, but no tour data found." });
    }

    const { date, day, time, tour_size, teacher_name, tour_status, school_name } = tourResult.rows[0];

    // 5. Prepare and send email to admins if available
    if (adminEmails.length > 0) {
      const subject = "Guide Withdrawn from Tour";
      const formattedDate = new Date(date).toLocaleDateString();
      const html = `
        <p>Dear Admin,</p>
        <p>The following guide has withdrawn from the tour:</p>
        <ul>
          <li><strong>Guide Name:</strong> ${first_name} ${last_name}</li>
          <li><strong>Guide ID:</strong> ${userId}</li>
          <li><strong>Tour ID:</strong> ${tourId}</li>
        </ul>
        <p>Tour Details:</p>
        <ul>
          <li><strong>School Name:</strong> ${school_name}</li>
          <li><strong>Date:</strong> ${formattedDate}</li>
          <li><strong>Day:</strong> ${day}</li>
          <li><strong>Time:</strong> ${time}</li>
          <li><strong>Tour Size:</strong> ${tour_size}</li>
          <li><strong>Teacher Name:</strong> ${teacher_name}</li>
        </ul>
        <p>Please update your records accordingly.</p>
        <p>Best regards,<br/>Tour Management System</p>
      `;

      try {
        await sendEmail({
          to: adminEmails.join(","),
          subject,
          html
        });
        console.log("Notification emails sent to admins:", adminEmails);
      } catch (emailError) {
        console.error("Failed to send notification emails to admins:", emailError);
        // Not throwing error to ensure the endpoint returns success for the withdrawal
      }
    }

    res.status(200).json({ success: true, message: "Successfully withdrawn from the tour and admins notified" });
  } catch (error) {
    console.error("Error withdrawing from tour:", error.message || error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


exports.fetchDoneTours = async (req, res) => {
  try {
    const doneTours = await getDoneTours();
    res.status(200).json({
      success: true,
      data: doneTours,
    });
  } catch (error) {
    console.error('Error in fetchDoneTours controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch done tours',
    });
  }
};
exports.getToursByUserId = async (req, res) => {
  const { user_id } = req.query; // Expect a single user ID in the query parameter

  if (!user_id) {
    return res.status(400).json({ success: false, message: "No user ID provided" });
  }

  try {
    const sql = `
      SELECT DISTINCT t.id AS tour_id, t.date, s.school_name
      FROM tours t
      JOIN tour_guide tg ON t.id = tg.tour_id
      JOIN schools s ON t.school_id = s.id
      WHERE tg.guide_id = $1 AND t.tour_status = 'DONE';
    `;

    const result = await query(sql, [user_id]);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching tours by user ID:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.getUsersByTourId = async (req, res) => {
  const { tour_id } = req.query; // Expect the tour ID in the query parameter

  if (!tour_id) {
    return res.status(400).json({ success: false, message: "No tour ID provided" });
  }

  try {
    const sql = `
      SELECT 
        u.id AS user_id,
        u.first_name,
        u.last_name,
        CASE WHEN u.user_type = 1 THEN 'Candidate' ELSE 'Guide' END AS role
      FROM users u
      JOIN tour_guide tg ON u.id = tg.guide_id
      WHERE tg.tour_id = $1;
    `;

    const result = await query(sql, [tour_id]);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching users by tour ID:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.requestToJoinTour = async (req, res) => {
  const { tourId, guideId } = req.body;
  console.log("Received request body:", req.body); // Debug log

  if (!tourId || !guideId) {
    return res.status(400).json({ message: "Tour ID and Guide ID are required" });
  }

  try {
    const existingRequest = await query(
      "SELECT * FROM tour_requests WHERE tour_id = $1 AND guide_id = $2",
      [tourId, guideId]
    );

    if (existingRequest.rowCount > 0) {
      return res.status(400).json({ message: "You have already requested to join this tour." });
    }

    await query("INSERT INTO tour_requests (tour_id, guide_id) VALUES ($1, $2)", [tourId, guideId]);

    res.status(201).json({ message: "Request sent successfully" });
  } catch (error) {
    console.error("Error requesting to join tour:", error);
    res.status(500).json({ message: "Failed to send request" });
  }
};

exports.getDistinctSchoolsAndCities = async (req, res) => {
  const { city } = req.query;

  try {
    let schoolQuery = `
      SELECT DISTINCT school_name
      FROM schools
    `;
    const queryParams = [];

    if (city) {
      schoolQuery += ` WHERE city = $1`;
      queryParams.push(city);
    }

    const schoolsResult = await query(schoolQuery, queryParams);
    const citiesResult = await query(`SELECT DISTINCT city FROM schools`);

    res.status(200).json({
      success: true,
      schools: schoolsResult.rows.map((row) => row.school_name),
      cities: citiesResult.rows.map((row) => row.city),
    });
  } catch (error) {
    console.error("Error fetching distinct schools and cities:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

