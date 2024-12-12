const db = require("../config/database");
const { sendEmail } = require('../utils/email'); // Import the function

exports.getFairs = async (req, res) => {
    const { status } = req.query; // Extract status from query parameters

    try {
        let query = `
            SELECT fairs.*,
                u1.first_name || ' ' || u1.last_name AS guide_1_name,
                u2.first_name || ' ' || u2.last_name AS guide_2_name,
                u3.first_name || ' ' || u3.last_name AS guide_3_name
            FROM fairs
            LEFT JOIN users u1 ON fairs.guide_1_id = u1.id
            LEFT JOIN users u2 ON fairs.guide_2_id = u2.id
            LEFT JOIN users u3 ON fairs.guide_3_id = u3.id
        `;

        const params = [];
        if (status) {
            query += ` WHERE fairs.status = $1`; // Filter by status if provided
            params.push(status);
        }

        const result = await db.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching fairs:", error);
        res.status(500).send({ message: "Error fetching fairs" });
    }
};



exports.createFair = async (req, res) => {
    const { date, organization_name, city, applicant_name, applicant_email, applicant_phone } = req.body;
    try {
        const result = await db.query(
            `INSERT INTO fairs (date, organization_name, city, applicant_name, applicant_email, applicant_phone, status)
             VALUES ($1, $2, $3, $4, $5, $6, 'WAITING') RETURNING *`,
            [date, organization_name, city, applicant_name, applicant_email, applicant_phone]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating fair:', error);
        res.status(500).send({ message: 'Error creating fair' });
    }
};

exports.createFairRequest = async (req, res) => {
    const { fair_id, guide_id } = req.body;

    if (!fair_id || !guide_id) {
        return res.status(400).send({ message: 'Fair ID and Guide ID are required' });
    }

    try {
        // Check if the request already exists
        const existingRequest = await db.query(
            `SELECT * FROM fair_requests WHERE fair_id = $1 AND guide_id = $2`,
            [fair_id, guide_id]
        );
        if (existingRequest.rowCount > 0) {
            return res.status(400).json({ message: 'You already applied for this fair.' });
        }

        // Insert the new fair request
        await db.query(
            `INSERT INTO fair_requests (fair_id, guide_id) VALUES ($1, $2)`,
            [fair_id, guide_id]
        );
        res.status(201).send({ message: 'Request created successfully' });
    } catch (error) {
        console.error('Error creating fair request:', error);
        res.status(500).send({ message: 'Error creating fair request' });
    }
};


exports.assignGuide = async (req, res) => {
    const { id } = req.params;
    const { column, guideId } = req.body;

    // Validate the column name
    const validColumns = ['guide_1_id', 'guide_2_id', 'guide_3_id'];
    if (!validColumns.includes(column)) {
        return res.status(400).send({ message: "Invalid column name" });
    }

    try {
        // Dynamically assign the guide to the selected column
        const updateQuery = `UPDATE fairs SET ${column} = $1 WHERE id = $2 RETURNING *`;
        const result = await db.query(updateQuery, [guideId, id]);

        if (result.rows.length === 0) {
            return res.status(404).send({ message: 'Fair not found' });
        }

        const updatedFair = result.rows[0];
        console.log("Updated Fair:", updatedFair); // Log updated fair data

        // Extract assigned guide IDs (some might be null if not assigned)
        const assignedGuideIds = [updatedFair.guide_1_id, updatedFair.guide_2_id, updatedFair.guide_3_id]
            .filter(gid => gid !== null);

        if (assignedGuideIds.length === 0) {
            // No guides assigned yet
            return res.send({
                message: 'Guide assigned successfully, but no assigned guides found to email.',
                updatedFair
            });
        }

        // Fetch details for assigned guides
        // We assume `users` table has `id`, `email`, `first_name`, and `last_name`
        const usersQuery = `
            SELECT id, email, first_name, last_name
            FROM users
            WHERE id = ANY($1::int[])
        `;
        const usersResult = await db.query(usersQuery, [assignedGuideIds]);

        const assignedGuides = usersResult.rows; // [{id, email, first_name, last_name}, ...]

        // Prepare email content
        // Include fair info: date, organization_name, city, applicant_name, applicant_email, applicant_phone, status
        const {
            date,
            organization_name,
            city,
            applicant_name,
            applicant_email,
            applicant_phone,
            status
        } = updatedFair;

        const subject = "You have been assigned to a fair";
        const htmlContent = `
            <p>Dear Guide,</p>
            <p>You have been assigned to the following fair:</p>
            <ul>
              <li><strong>Organization Name:</strong> ${organization_name}</li>
              <li><strong>City:</strong> ${city}</li>
              <li><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</li>
              <li><strong>Applicant Name:</strong> ${applicant_name}</li>
              <li><strong>Applicant Email:</strong> ${applicant_email}</li>
              <li><strong>Applicant Phone:</strong> ${applicant_phone}</li>
              <li><strong>Status:</strong> ${status}</li>
            </ul>
            <p>Thank you for being part of our team!</p>
            <p>Best regards,<br/>Fair Management Team</p>
        `;

        // Send email to all assigned guides
        for (const guide of assignedGuides) {
            // Optionally, personalize the email for each guide
            const personalizedHtml = `
                <p>Dear ${guide.first_name} ${guide.last_name},</p>
                ${htmlContent}
            `;
            
            try {
                await sendEmail({
                    to: guide.email,
                    subject,
                    html: personalizedHtml
                });
                console.log(`Email sent successfully to guide_id ${guide.id}: ${guide.email}`);
            } catch (emailError) {
                console.error(`Failed to send email to guide_id ${guide.id}: ${guide.email}`, emailError);
            }
        }

        res.send({ message: 'Guide assigned successfully and emails sent', updatedFair });
    } catch (error) {
        console.error('Error assigning guide:', error);
        res.status(500).send({ message: 'Error assigning guide' });
    }
};

exports.getAvailableGuides = async (req, res) => {
    const { fairId } = req.query;
    try {
        const result = await db.query(
            `SELECT users.id, users.first_name || ' ' || users.last_name AS full_name
             FROM users
             WHERE users.id IN (
                 SELECT guide_id FROM fair_requests WHERE fair_id = $1
             )`,
            [fairId]
        );
        console.log('Available Guides:', result.rows); // Log result
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching available guides:', error);
        res.status(500).send({ message: 'Error fetching available guides' });
    }
};


exports.approveFair = async (req, res) => {
    const { id } = req.params;

    try {
        // Update the fair status to APPROVED
        const fair = await db.query(`UPDATE fairs SET status = 'APPROVED' WHERE id = $1 RETURNING *`, [id]);

        if (fair.rowCount === 0) {
            return res.status(404).json({ message: 'Fair not found' });
        }

        const { applicant_email, applicant_name } = fair.rows[0];

        // Send an approval email
        const emailContent = `
            <p>Dear ${applicant_name || "Applicant"},</p>
            <p>Your fair application has been approved.</p>
            <p>Thank you for your interest. We look forward to working with you.</p>
            <p>Best Regards,<br/>BTO Team</p>
        `;

        await sendEmail({
            to: applicant_email,
            subject: 'Fair Application Approved',
            html: emailContent,
        });

        res.status(200).json({ message: 'Fair approved and email sent successfully' });
    } catch (error) {
        console.error('Error approving fair:', error.message);
        res.status(500).json({ message: 'Error approving fair' });
    }
};


exports.cancelFair = async (req, res) => {
    const { id } = req.params;

    try {
        // Update the fair status to CANCELLED
        const fair = await db.query(`UPDATE fairs SET status = 'CANCELLED' WHERE id = $1 RETURNING *`, [id]);

        if (fair.rowCount === 0) {
            return res.status(404).json({ message: 'Fair not found' });
        }

        const { applicant_email, applicant_name } = fair.rows[0];

        // Send a cancellation email
        const emailContent = `
            <p>Dear ${applicant_name || "Applicant"},</p>
            <p>We regret to inform you that your fair application has been cancelled.</p>
            <p>If you have any questions, please contact our team.</p>
            <p>Best Regards,<br/>BTO Team</p>
        `;

        await sendEmail({
            to: applicant_email,
            subject: 'Fair Application Cancelled',
            html: emailContent,
        });

        res.status(200).json({ message: 'Fair cancelled and email sent successfully' });
    } catch (error) {
        console.error('Error cancelling fair:', error.message);
        res.status(500).json({ message: 'Error cancelling fair' });
    }
};

exports.unassignGuide = async (req, res) => {
    const { id } = req.params; // Fair ID
    const { column } = req.body; // Column to unassign the guide from

    // Validate the column name
    const validColumns = ['guide_1_id', 'guide_2_id', 'guide_3_id'];
    if (!validColumns.includes(column)) {
        return res.status(400).send({ message: "Invalid column name" });
    }

    try {
        // Dynamically set the column to NULL
        const query = `UPDATE fairs SET ${column} = NULL WHERE id = $1 RETURNING *`;
        const result = await db.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Fair not found" });
        }

        console.log("Guide unassigned:", result.rows[0]);
        res.send({ message: "Guide unassigned successfully", updatedFair: result.rows[0] });
    } catch (error) {
        console.error("Error unassigning guide:", error);
        res.status(500).send({ message: "Error unassigning guide" });
    }
};

exports.getAssignedFairs = async (req, res) => {
    const userId = req.user.userId; // Assuming userId is available from authentication middleware
    try {
        const result = await db.query(`
            SELECT fairs.*, 
                   u1.first_name || ' ' || u1.last_name AS guide_1_name,
                   u2.first_name || ' ' || u2.last_name AS guide_2_name,
                   u3.first_name || ' ' || u3.last_name AS guide_3_name
            FROM fairs
            LEFT JOIN users u1 ON fairs.guide_1_id = u1.id
            LEFT JOIN users u2 ON fairs.guide_2_id = u2.id
            LEFT JOIN users u3 ON fairs.guide_3_id = u3.id
            WHERE $1 = ANY(ARRAY[fairs.guide_1_id, fairs.guide_2_id, fairs.guide_3_id])
        `, [userId]);

        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching assigned fairs:", error);
        res.status(500).send({ message: "Error fetching assigned fairs" });
    }
};

exports.getAvailableFairsForUser = async (req, res) => {
    const userId = req.user.userId; // Assuming `userId` is set by middleware
    try {
        const query = `
            SELECT fairs.*,
                u1.first_name || ' ' || u1.last_name AS guide_1_name,
                u2.first_name || ' ' || u2.last_name AS guide_2_name,
                u3.first_name || ' ' || u3.last_name AS guide_3_name
            FROM fairs
            LEFT JOIN users u1 ON fairs.guide_1_id = u1.id
            LEFT JOIN users u2 ON fairs.guide_2_id = u2.id
            LEFT JOIN users u3 ON fairs.guide_3_id = u3.id
            WHERE fairs.status = 'APPROVED'
            AND NOT EXISTS (
                SELECT 1 FROM fair_requests
                WHERE fair_requests.fair_id = fairs.id
                AND fair_requests.guide_id = $1
            )
        `;

        const result = await db.query(query, [userId]); // Filter fairs for the specific user
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching available fairs:", error);
        res.status(500).send({ message: "Error fetching available fairs" });
    }
};

