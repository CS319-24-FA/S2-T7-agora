const { query } = require("../config/database");

exports.getPaginatedFeedback = async (limit, offset) => {
  const sql = `
    SELECT 
      t.id AS tour_id,
      t.date AS tour_date,
      t.day AS tour_day,
      t.time AS tour_time,
      s.school_name,
      s.city,
      t.tour_size,
      t.guide_count,
      f.sender_id,
      sender.first_name || ' ' || sender.last_name AS sender_name, -- Fetch sender's name
      f.text_feedback,
      f.user_ids,
      (
        SELECT array_agg(u.first_name || ' ' || u.last_name)
        FROM users u
        WHERE u.id = ANY(f.user_ids)
      ) AS user_names, -- Fetch names for all user_ids
      (
        SELECT array_agg(
          CASE 
            WHEN u.user_type = 1 THEN 'Candidate'
            ELSE 'Guide'
          END
        )
        FROM users u
        WHERE u.id = ANY(f.user_ids)
      ) AS user_roles, -- Fetch roles for all user_ids
      f.id AS feedback_id,
      f.filename,
      f.upload_date
    FROM tours t
    JOIN schools s ON t.school_id = s.id
    LEFT JOIN feedback f ON f.tour_id = t.id
    LEFT JOIN users sender ON f.sender_id = sender.id -- Join to fetch sender details
    WHERE t.tour_status = 'DONE'
    ORDER BY f.upload_date DESC
    LIMIT $1 OFFSET $2;
  `;
  return await query(sql, [limit, offset]);
};





exports.addFeedback = async (filename, fileType, fileSize, s3Url, userId, tourId) => {
  const sql = `
    INSERT INTO feedback (filename, file_type, file_size, s3_url, user_id, tour_id)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id;
  `;
  return await query(sql, [filename, fileType, fileSize, s3Url, userId, tourId]);
};

exports.deleteFeedback = async (feedbackId) => {
  const sql = `DELETE FROM feedback WHERE id = $1 RETURNING s3_url;`;
  return await query(sql, [feedbackId]);
};

exports.createFeedback = async (userIds, tourId, textFeedback, senderId) => {
  const result = await query(
    `INSERT INTO feedback (user_ids, tour_id, text_feedback, sender_id) 
     VALUES ($1, $2, $3, $4) 
     RETURNING id, user_ids, tour_id, text_feedback, sender_id`,
    [userIds, tourId, textFeedback, senderId]
  );
  return result.rows[0]; // Return the newly inserted feedback row
};


