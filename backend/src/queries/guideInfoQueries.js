// src/queries/guideInfoQueries.js

const db = require('../config/database');

exports.getGuideInfo = async (filters) => {
  const {
    name,
    role,
    department,
    iban,
    crew_no,
    sort_by = 'first_name',
    order = 'asc',
    page = 1,
    limit = 10,
  } = filters;

  const offset = (page - 1) * limit;

  // Validate and sanitize sort_by and order
  const allowedSortFields = ['first_name', 'last_name', 'email', 'role', 'department'];
  const sortBy = allowedSortFields.includes(sort_by) ? sort_by : 'first_name';

  const allowedOrder = ['asc', 'desc'];
  const sortOrder = allowedOrder.includes(order.toLowerCase()) ? order.toUpperCase() : 'ASC';

  // Base query to fetch guide info
  let query = `
    SELECT 
      u.id,
      u.first_name, 
      u.last_name, 
      u.email, 
      u.role, 
      u.department, 
      u.phone_number, 
      u.iban,
      u.crew_no,
      s.schedule_data
    FROM 
      users u
    LEFT JOIN 
      schedules s 
    ON 
      u.id = s.user_id
    WHERE 
      u.role IN ('guide', 'advisor', 'coordinator')
  `;

  // Initialize query parameters array
  const queryParams = [];
  let paramIndex = 1; // Keep track of parameter index for placeholders ($1, $2, etc.)

  // Apply filters if provided
  if (name) {
    query += ` AND (u.first_name ILIKE $${paramIndex} OR u.last_name ILIKE $${paramIndex})`;
    queryParams.push(`%${name}%`);
    paramIndex++;
  }

  if (role) {
    query += ` AND u.role ILIKE $${paramIndex}`;
    queryParams.push(`%${role}%`);
    paramIndex++;
  }

  if (department) {
    query += ` AND u.department ILIKE $${paramIndex}`;
    queryParams.push(`%${department}%`);
    paramIndex++;
  }

  // Apply sorting
  query += ` ORDER BY ${sortBy} ${sortOrder}`;

  // Apply pagination
  query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
  queryParams.push(limit, offset);

  // Execute the query
  const result = await db.query(query, queryParams);
  return result.rows;
};
