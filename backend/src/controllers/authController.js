const { verifyToken, generateToken } = require("../utils/jwt");
const emailService = require("../services/EmailService");
const userService = require("../services/UserService");
const otpService = require("../services/OtpService.js");
const pool = require('../config/database'); // Adjust the path based on your project structure

exports.register = async (req, res) => {
  try {
    if (!req.body.email.endsWith("@ug.bilkent.edu.tr")) {
      return res
        .status(400)
        .json({ message: "Email must be a valid Bilkent email." });
    }

    const existingUser = await userService.findUserByEmail(req.body.email);
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Ensure `days` is stored as an array in the database for advisors
    const userPayload = {
      ...req.body,
      days: Array.isArray(req.body.days) ? req.body.days : [req.body.days],
    };
    
    if (req.body.role === "coordinator") {
      userPayload.crew_no = 1;
    }

<<<<<<< HEAD
    res.status(200).json({
      success: true,
      message: "User registered successfully.",
      userId: userId,
    });
=======
    const { userId, password } = await userService.createUser(userPayload);

    if (req.body.role === "advisor") {
      // Save or update the advisor in the advisors table
      await pool.query(
        `INSERT INTO advisors 
         (user_id, day, full_name, created_at, updated_at) 
         VALUES ($1, $2, $3, NOW(), NOW()) 
         ON CONFLICT (user_id) 
         DO UPDATE SET day = EXCLUDED.day, 
                       full_name = EXCLUDED.full_name, 
                       updated_at = NOW()`,
        [userId, req.body.days.join(","), `${req.body.first_name} ${req.body.last_name}`]
      );
    } else if (req.body.role === "candidate guide") {
      const advisor = await userService.findAdvisorByName(req.body.advisor_name);
      if (!advisor) {
        return res.status(404).json({ message: "Advisor not found." });
      }

      // Save or update the candidate guide in the candidate_guides table
      await pool.query(
        `INSERT INTO candidate_guides 
         (user_id, advisor_user_id, advisor_name, full_name, department, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
         ON CONFLICT (user_id) 
         DO UPDATE SET advisor_user_id = EXCLUDED.advisor_user_id, 
                       advisor_name = EXCLUDED.advisor_name, 
                       full_name = EXCLUDED.full_name, 
                       department = EXCLUDED.department, 
                       updated_at = NOW()`,
        [
          userId,
          advisor.user_id,
          req.body.advisor_name,
          `${req.body.first_name} ${req.body.last_name}`,
          req.body.department,
        ]
      );
    }

    await emailService.sendRegistrationEmail(req.body.email, password);
    res
      .status(200)
      .json({ success: true, message: "User registered successfully." });
>>>>>>> 4da22dd97c86aadab89f12eda8be834d3f85beb5
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
};



exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isPasswordValid = await userService.verifyPassword(
      password,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const otp = await otpService.generateAndSaveOTP(user.id);
    await emailService.sendLoginOTPEmail(email, otp);

    const token = generateToken(user.id, user.user_type, true);

    return res.json({
      message: "Login successful",
      token: token,
      user_type: user.user_type,
      user_id: user.id,
    });
  } catch (error) {
    console.log("Error in login function:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.verifyOtp = async (req, res) => {
  const { otp } = req.body;
  const tempToken = req.headers.authorization?.split(" ")[1];

  try {
    const decoded = verifyToken(tempToken);
    if (!decoded.isTemp) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const isValid = await otpService.verifyOTP(decoded.userId, otp);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid or expired verification code" });
    }

    if (typeof decoded.user_type !== 'number') {
      return res.status(401).json({ message: "Malformed token" });
    }

    const accessToken = generateToken(decoded.userId, decoded.user_type, false);

    res.json({
      message: "Verification successful",
      token: accessToken,
    });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json(err);
  }
};

exports.deleteUserByEmail = async (req, res) => {
  const { email } = req.body;
  const deletedUser = await userService.deleteUserByEmail(email);

  if (!deletedUser) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json({
    message: "User deleted successfully",
    email: deletedUser.email,
  });
};

exports.updatePassword = async (req, res) => {
  const { email, oldPassword, newPassword, confirmNewPassword } = req.body;

  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ message: "New passwords do not match" });
  }

  const result = await userService.updateUserPassword(
    email,
    oldPassword,
    newPassword
  );

  if (result === null) {
    return res.status(404).json({ message: "User not found" });
  }

  if (result === false) {
    return res.status(400).json({ message: "Old password is incorrect" });
  }

  return res.status(200).json({ message: "Password updated successfully" });
};

exports.getUser = async (req, res) => {
  const user = await userService.getUserById(req.user.userId);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  res.json(user);
};

exports.getAllUsers = async (req, res) => {
  const users = await userService.getAllUsers();
  res.json(users);
};

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  const resetToken = await userService.requestPasswordReset(email);

  if (!resetToken) {
    return res.status(404).json({ message: "No user found with this email" });
  }

  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  await emailService.sendPasswordResetEmail(email, resetLink);

  res.json({ message: "Password reset email sent" });
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  const result = await userService.resetPassword(token, newPassword);

  if (!result) {
    return res.status(400).json({ message: "Invalid or expired reset token" });
  }

  res.json({ message: "Password reset successful" });
};
