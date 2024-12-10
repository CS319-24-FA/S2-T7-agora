const pool = require('../config/database'); // Ensure this points to your DB connection

// Get all advisors for the table
const getAdvisors = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                a.user_id AS advisor_id,
                a.full_name AS advisor_name,
                ARRAY_AGG(DISTINCT a.day) AS days, -- Array of days
                COALESCE(
                    json_agg(
                        json_build_object(
                            'full_name', cg.full_name,
                            'department', cg.department,
                            'phone_number', cg.phone_number
                        )
                    ) FILTER (WHERE cg.full_name IS NOT NULL),
                    '[]'
                ) AS candidate_guides
            FROM advisors a
            LEFT JOIN candidate_guides cg ON a.user_id = cg.advisor_user_id
            GROUP BY a.user_id, a.full_name
            ORDER BY a.user_id ASC;
        `);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching advisors:", error);
        res.status(500).send("Server error");
    }
};



// Get details for a specific advisor
const getAdvisorDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const advisor = await pool.query(`
            SELECT 
                user_id, 
                full_name AS advisor_name, 
                day 
            FROM advisors
            WHERE user_id = $1;
        `, [id]);

        if (advisor.rows.length === 0) {
            return res.status(404).json({ message: "Advisor not found" });
        }

        const candidateGuides = await pool.query(`
            SELECT 
                full_name, 
                department, 
                phone_number 
            FROM candidate_guides
            WHERE advisor_user_id = $1;
        `, [id]);

        res.json({
            advisor: advisor.rows[0],
            candidateGuides: candidateGuides.rows,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
};


module.exports = {
    getAdvisors,
    getAdvisorDetails,
};

