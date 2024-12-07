const { query } = require("../config/database");

// Check if a tour exists for a school on a specific date
exports.doesTourExist = async (school_id, date) => {
  const result = await query(
    "SELECT * FROM tours WHERE school_id = $1 AND date = $2",
    [school_id, date]
  );
  return result.rows.length > 0;
};

exports.insertTour = async ({
  school_id,
  date,
  day,
  tour_size,
  guide_count,
  teacher_name,
  teacher_phone,
  teacher_email,
  visitor_notes, // Added visitor_notes
}) => {
  const result = await query(
    `INSERT INTO tours (
        school_id,
        date,
        day,
        tour_size,
        guide_count,
        teacher_name,
        teacher_phone,
        teacher_email,
        visitor_notes
      )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
    [
      school_id,
      date,
      day,
      tour_size,
      guide_count,
      teacher_name,
      teacher_phone,
      teacher_email,
      visitor_notes, // Added visitor_notes to values
    ]
  );
  return result.rows[0].id;
};

// Get tour details by school name, city, date, and time
exports.fetchTourDetails = async (school_name, city, date, time) => {
  const tourQuery = await query(
    `SELECT t.id, t.guide_count
     FROM tours t
     JOIN schools s ON t.school_id = s.id
     WHERE s.school_name = $1 AND s.city = $2 AND t.date = $3 AND t.time = $4`,
    [school_name, city, date, time]
  );

  if (tourQuery.rows.length === 0) {
    throw new Error("Tour not found");
  }

  return tourQuery.rows[0]; // Returns { id: tour_id, guide_count }
};

// Check if a user is already assigned to a tour
exports.isUserAssignedToTour = async (tour_id, user_id) => {
  const result = await query(
    "SELECT 1 FROM tour_guide WHERE tour_id = $1 AND guide_id = $2",
    [tour_id, user_id]
  );
  return result.rows.length > 0;
};

// Check if a user has scheduling conflicts
exports.hasSchedulingConflict = async (user_id, date, time) => {
  const result = await query(
    `SELECT 1 
     FROM tour_guide tg
     JOIN tours t ON tg.tour_id = t.id
     WHERE tg.guide_id = $1 AND t.date = $2 AND t.time = $3`,
    [user_id, date, time]
  );
  return result.rows.length > 0;
};

// Fetch the number of assigned guides and candidates
exports.fetchAssignmentCounts = async (tour_id) => {
  const result = await query(
    `SELECT 
       COUNT(CASE WHEN u.user_type = 1 THEN 1 END) AS assigned_candidates,
       COUNT(CASE WHEN u.user_type != 1 THEN 1 END) AS assigned_guides,
       STRING_AGG(CASE WHEN u.user_type = 1 THEN u.first_name || ' ' || u.last_name END, ', ') AS candidate_names,
       STRING_AGG(CASE WHEN u.user_type != 1 THEN u.first_name || ' ' || u.last_name END, ', ') AS guide_names
     FROM tour_guide tg
     JOIN users u ON tg.guide_id = u.id
     WHERE tg.tour_id = $1`,
    [tour_id]
  );

  return {
    assigned_candidates: parseInt(result.rows[0].assigned_candidates, 10),
    assigned_guides: parseInt(result.rows[0].assigned_guides, 10),
    candidate_names: result.rows[0].candidate_names || "", // Initialize empty string if null
    guide_names: result.rows[0].guide_names || "", // Initialize empty string if null
  };
};


// Validate if the quota is exceeded
exports.validateQuota = (assigned_count, new_count, limit, type) => {
  console.log("new count: " + new_count);
  console.log(assigned_count + new_count);
  if (type === "guide" && assigned_count + new_count > limit) {
    throw new Error("Guide quota exceeded!");
  }
  if (type === "candidate" && assigned_count + new_count > limit) {
    throw new Error("Candidate quota exceeded!");
  }
};

// Insert time preferences for a tour
// src/queries/tourQueries.js

exports.insertTourTimes = async (tour_id, time_preferences) => {
  // Validate time preferences
  const allowedTimes = ['09:00', '11:00', '13:30', '16:00'];
  if (time_preferences.length < 1 || time_preferences.length > 4) {
    throw new Error('You must provide between 1 and 4 time preferences.');
  }

  // Check for duplicates
  if (new Set(time_preferences).size !== time_preferences.length) {
    throw new Error('Time preferences cannot have duplicates.');
  }

  // Validate time preferences
  time_preferences.forEach((time) => {
    if (!allowedTimes.includes(time)) {
      throw new Error(`Invalid time preference: ${time}`);
    }
  });

  // Prepare columns and values
  const columns = ['tour_id', 'timepref1', 'timepref2', 'timepref3', 'timepref4'];
  const placeholders = columns.map((_, idx) => `$${idx + 1}`).join(', ');
  const values = [tour_id, null, null, null, null];

  // Assign time preferences to appropriate columns
  time_preferences.forEach((time, index) => {
    values[index + 1] = time; // timepref1 starts at index 1
  });

  const result = await query(
    `INSERT INTO tour_time (${columns.join(', ')})
     VALUES (${placeholders}) RETURNING id`,
    values
  );

  return result.rows[0].id;
};



// Check if a guide is already assigned to a tour
exports.isGuideAssignedToTour = async (tour_id, guide_id) => {
  const result = await query(
    "SELECT * FROM tour_guide WHERE tour_id = $1 AND guide_id = $2",
    [tour_id, guide_id]
  );
  return result.rows.length > 0;
};

// Count the number of assigned guides for a tour
exports.getAssignedGuideCount = async (tour_id) => {
  const result = await query(
    "SELECT COUNT(*) AS assigned_count FROM tour_guide WHERE tour_id = $1",
    [tour_id]
  );
  return parseInt(result.rows[0].assigned_count, 10);
};

// Get the guide_count for a tour
exports.getGuideCountForTour = async (tour_id) => {
  const result = await query(
    "SELECT guide_count FROM tours WHERE id = $1",
    [tour_id]
  );
  return result.rows.length > 0 ? parseInt(result.rows[0].guide_count, 10) : null;
};

// Get all tours with status 'READY'
exports.getReadyTours = async () => {
  const result = await query(
    `SELECT 
        t.id,
        t.date,
        t.day,
        t.time,
        t.tour_status,
        s.school_name,
        s.city,
        t.tour_size,
        t.classroom,
        t.guide_count,
        (SELECT STRING_AGG(u.first_name || ' ' || u.last_name, ', ') 
        FROM tour_guide tg
        JOIN users u ON tg.guide_id = u.id
        WHERE tg.tour_id = t.id AND u.user_type != 1) AS guide_names,
        (SELECT STRING_AGG(u.first_name || ' ' || u.last_name, ', ') 
        FROM tour_guide tg
        JOIN users u ON tg.guide_id = u.id
        WHERE tg.tour_id = t.id AND u.user_type = 1) AS candidate_names,
        (SELECT COUNT(*) 
        FROM tour_guide tg 
        JOIN users u ON tg.guide_id = u.id 
        WHERE tg.tour_id = t.id AND u.user_type = 1) AS assigned_candidates,
        
        (SELECT COUNT(*) 
        FROM tour_guide tg 
        JOIN users u ON tg.guide_id = u.id 
        WHERE tg.tour_id = t.id AND u.user_type != 1) AS assigned_guides
      FROM tours t
      JOIN schools s ON t.school_id = s.id
      WHERE t.tour_status IN ('READY', 'CANCELLED', 'DONE') 
      ORDER BY t.date, t.time;`
  );
  // Ensure that assigned_candidates and assigned_guides are integers
  return result.rows.map(row => ({
    ...row,
    assigned_candidates: parseInt(row.assigned_candidates || '0', 10),
    assigned_guides: parseInt(row.assigned_guides || '0', 10),
  }));
};



exports.fetchCandidateGuides = async () => {
  const result = await query(
    `SELECT user_id AS id, full_name AS name
     FROM candidate_guides
     ORDER BY full_name`
  );
  return result.rows;
};

const fetchGuidesAndCandidatesForTours = async (tourIds) => {
  // SQL query to fetch both guides and candidates in one batch
  const queryResult = await query(
    `
    -- Fetch Guides (user_type != 1)
    SELECT 
      t.id AS tour_id,
      u.first_name, u.last_name, u.user_type, u.id AS user_id
    FROM tours t
    LEFT JOIN tour_guide tg ON t.id = tg.tour_id
    LEFT JOIN users u ON tg.user_id = u.id
    WHERE t.id IN (${tourIds.join(', ')}) AND u.user_type != 1

    UNION ALL

    -- Fetch Candidates (user_type = 1)
    SELECT 
      t.id AS tour_id,
      u.first_name, u.last_name, u.user_type, u.id AS user_id
    FROM tours t
    LEFT JOIN tour_guide tg ON t.id = tg.tour_id
    LEFT JOIN users u ON tg.user_id = u.id
    WHERE t.id IN (${tourIds.join(', ')}) AND u.user_type = 1
    `,
    []
  );
  return queryResult.rows;  // List of guides and candidates for those tours
};

// Get all tours with all attributes and associated school details
exports.getAllTours = async () => {
  const result = await query(
    `SELECT 
        t.id AS tour_id,
        t.tour_status,
        s.school_name,
        s.city,
        t.date,
        t.day,
        t.tour_size,
        t.teacher_name,
        t.teacher_phone,
        t.time,
        t.classRoom, 
        t.visitor_notes,
        tt.timepref1,
        tt.timepref2,
        tt.timepref3,
        tt.timepref4
     FROM tours t
     JOIN schools s ON t.school_id = s.id
     LEFT JOIN tour_time tt ON t.id = tt.tour_id
     ORDER BY t.date ASC` // Ordering by tour_id in descending order
  );
  return result.rows;
};

/*exports.approveTour = async (tourId, selectedTime) => {
  const allowedTimes = ['09:00', '11:00', '13:30', '16:00'];
  if (!allowedTimes.includes(selectedTime)) {
    throw new Error('Invalid time preference');
  }
  const result = await query(
    `UPDATE tours 
     SET time = $1, tour_status = 'APPROVED'
     WHERE id = $2
     RETURNING teacher_email, teacher_name`,
    [selectedTime, tourId]
  );
  if (result.rows.length === 0) {
    throw new Error('Tour not found or already approved');
  }
  return result.rows[0];
};*/

exports.rejectTour = async (tourId) => {
  const result = await query(
    `UPDATE tours 
     SET time = NULL, tour_status = 'REJECTED'
     WHERE id = $1
     RETURNING teacher_email, teacher_name`,
    [tourId]
  );
  if (result.rows.length === 0) {
    throw new Error('Tour not found or already rejected');
  }
  return result.rows[0];
};

// Update Classroom Function
exports.updateClassroom = async (tourId, classroom) => {
  await query(
    `UPDATE tours SET classroom = $1 WHERE id = $2`,
    [classroom, tourId]
  );
};

// Update Time Preference Function
exports.updateTime = async (tourId, selectedTime) => {
  const allowedTimes = ['09:00', '11:00', '13:30', '16:00'];

  // Validate the selected time
  if (!allowedTimes.includes(selectedTime)) {
    throw new Error('Invalid time preference. Allowed values are 09:00, 11:00, 13:30, or 16:00.');
  }

  // Update the time column in the database
  await query(
    `UPDATE tours SET time = $1 WHERE id = $2`,
    [selectedTime, tourId]
  );
};
exports.getDoneTours = async () => {
  try {
    const result = await query(
      `SELECT 
        t.id AS tour_id,
        t.tour_status,
        s.school_name,
        s.city,
        t.date,
        t.day
    FROM tours t
    JOIN schools s ON t.school_id = s.id
    WHERE t.tour_status = 'DONE' AND t.date IS NOT NULL
    ORDER BY t.date ASC;
    `
    );
    return result.rows;
  } catch (error) {
    console.error('Error fetching done tours:', error);
    throw new Error('Database query failed');
  }
};
