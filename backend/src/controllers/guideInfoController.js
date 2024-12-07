// src/controllers/guideInfoController.js

const { getGuideInfo } = require('../queries/guideInfoQueries');
require('dotenv').config();

exports.getGuideInfo = async (req, res) => {
  try {
    const {
      name,
      role,
      department,
      sort_by = 'first_name',
      order = 'asc',
      page = 1,
      limit = 10,
      include_schedule = false, // Query parameter to include schedule data
    } = req.query;

    // Parse pagination parameters
    const parsedPage = parseInt(page, 10) || 1;
    const parsedLimit = parseInt(limit, 10) || 10;

    // Fetch guide information from the database
    const guides = await getGuideInfo({
      name,
      role,
      department,
      sort_by,
      order,
      page: parsedPage,
      limit: parsedLimit,
    });

    // Map over the results to include or exclude schedule data
    const formattedResult = guides.map((row) => {
      if (include_schedule === 'true' && row.schedule_data) {
        // Include schedule data
        row.schedule_base64 = row.schedule_data;
        // Include MIME type if necessary
        row.schedule_mime_type = 'image/png'; // Adjust if using different formats
      } else {
        row.schedule_base64 = null;
        row.schedule_mime_type = null;
      }
      // Remove schedule_data from the response
      delete row.schedule_data;
      return {
        ...row,
        iban: row.iban || 'Not Provided',
        crew_no: row.crew_no || 'Not Provided',
      };
    });

    // Send the result as JSON
    return res.status(200).json(formattedResult);
  } catch (err) {
    // Log the error for debugging
    console.error('Error in getGuideInfo:', err.message);

    // Send a generic error response
    return res.status(500).json({
      error: 'An error occurred while fetching guide information.',
    });
  }
};
