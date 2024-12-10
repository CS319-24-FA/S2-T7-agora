const pool = require('../config/database'); // Ensure this points to your DB connection

exports.removeUser = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if the user exists in the users table
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const userId = userResult.rows[0].id; // Get user ID
        const userRole = userResult.rows[0].role; // Get user role

        // Remove user-specific records based on their role
        if (userRole === "advisor") {
            await pool.query("DELETE FROM advisors WHERE user_id = $1", [userId]);
        } else if (userRole === "candidate guide") {
            await pool.query("DELETE FROM candidate_guides WHERE user_id = $1", [userId]);
        }

        // Remove the user from the main users table
        await pool.query("DELETE FROM users WHERE id = $1", [userId]);

        res.status(200).json({ message: "User removed successfully from all relevant tables." });
    } catch (error) {
        console.error("Error removing user:", error);
        res.status(500).json({ error: "An error occurred while removing the user." });
    }
};


exports.changeUserRole = async (req, res) => {
    const { email, new_role, days } = req.body;

    try {
        // Fetch user details
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const userId = userResult.rows[0].id;
        const currentRole = userResult.rows[0].role;

        // If the new role is the same as the current role, return a warning
        if (currentRole === new_role) {
            return res.status(400).json({ message: `User is already a ${new_role}.` });
        }

        // Define role to user_type mapping
        const roleToUserType = {
            guide: 2,
            advisor: 3,
            coordinator: 4,
        };

        // Validate role
        if (!Object.keys(roleToUserType).includes(new_role)) {
            return res.status(400).json({ message: "Invalid role specified." });
        }

        // Update the role and user_type in the users table
        await pool.query(
            "UPDATE users SET role = $1, user_type = $2 WHERE id = $3",
            [new_role, roleToUserType[new_role], userId]
        );

        // Handle specific role-based actions
        if (new_role === "advisor") {
            if (!days || days.length === 0) {
                return res.status(400).json({ message: "Days are required for advisor role." });
            }

            // Add or update the user in the advisors table
            await pool.query(
                `INSERT INTO advisors (user_id, day, full_name, created_at, updated_at)
                 VALUES ($1, $2, $3, NOW(), NOW())
                 ON CONFLICT (user_id)
                 DO UPDATE SET day = EXCLUDED.day, updated_at = NOW()`,
                [userId, days.join(","), `${userResult.rows[0].first_name} ${userResult.rows[0].last_name}`]
            );
        } else {
            // If the old role is advisor and the new role is not, remove the user from the advisors table
            if (currentRole === "advisor") {
                await pool.query("DELETE FROM advisors WHERE user_id = $1", [userId]);
            }
        }

        if (new_role === "coordinator") {
            // Set crew_no to 1 for coordinators
            await pool.query("UPDATE users SET crew_no = $1 WHERE id = $2", [1, userId]);
        }

        res.status(200).json({ message: `User role updated to ${new_role} successfully.` });
    } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({ error: "An error occurred while updating the user role." });
    }
};




exports.updateCrewNo = async (req, res) => {
    const { email, crew_no } = req.body;

    try {
        if (!crew_no) {
            return res.status(400).json({ message: "Crew number is required" });
        }

        const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (user.rows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const userId = user.rows[0].id; // Correctly fetch the user ID from the table
        const currentCrewNo = user.rows[0].crew_no; // Fetch the current crew number
        console.log(currentCrewNo);
        console.log(crew_no);
        // Check if the new crew number is the same as the current one
        if (currentCrewNo == crew_no) {
            return res.status(400).json({ message: "The new crew number is the same as the current one." });
        }

        // Use the correct column name for the primary key in the users table
        await pool.query("UPDATE users SET crew_no = $1 WHERE id = $2", [crew_no, userId]);

        res.status(200).json({ message: "Crew number updated successfully" });
    } catch (error) {
        console.error("Error updating crew number:", error);
        res.status(500).json({ error: "An error occurred while updating the crew number" });
    }
};


exports.getAdvisors = async (req, res) => {
    try {
        console.log("Fetching advisors...");
        const result = await pool.query("SELECT full_name, user_id FROM advisors");
        console.log("Advisors fetched:", result.rows);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error fetching advisors:", error); // Log the exact error
        res.status(500).json({ message: "Error fetching advisors." });
    }
};

