const { query } = require("../config/database");

exports.insertIndividualTour = async ({
    name,
    major_of_interest,
    tour_date,
    day,
    time,
    number_of_students,
    contact_phone, // Remove spaces
    email,
    visitor_notes,
  }) => {
    console.log("Parameters for insertIndividualTour:", {
      name,
      major_of_interest,
      tour_date,
      day,
      time,
      number_of_students,
      contact_phone,
      email,
      visitor_notes,
    });
    const result = await query(
      `INSERT INTO individual_tours (
            contact_name,
            major_of_interest,
            date,
            day,
            time,
            tour_size,
            contact_phone, 
            contact_email,
            visitor_notes
        )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      [
        name,
        major_of_interest,
        tour_date,
        day,
        time,
        number_of_students,
        contact_phone,
        email,
        visitor_notes,
      ]
    );
    return result.rows[0].id;
  };