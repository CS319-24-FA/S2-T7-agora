const { sendEmail } = require("../utils/email");

class EmailService {
  async sendRegistrationEmail(email, password) {
    return await sendEmail({
      to: email,
      subject: "Account Details",
      html: this._getRegistrationTemplate(email, password),
    });
  }

  async sendLoginOTPEmail(email, otp) {
    return await sendEmail({
      to: email,
      subject: "Your Login Verification Code",
      html: this._getOTPTemplate(otp),
    });
  }

  async sendPasswordResetEmail(email, resetLink) {
    return await sendEmail({
      to: email,
      subject: "BTO Core Password Reset Request",
      html: this._getPasswordResetTemplate(resetLink),
    });
  }

  async sendIndividualTourConfirmationEmail(email, { name, tour_date, time }) {
    return await sendEmail({
      to: email,
      subject: "Your Tour Application Has Been Received",
      html: this._getIndividualTourConfirmationTemplate(name, tour_date, time),
    });
  }
  // Private template methods
  _getRegistrationTemplate(email, password) {
    return `
      <h1>Welcome to Our Platform</h1>
      <p>Your account has been created by an administrator. Here are your login details:</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Password:</strong> ${password}</p>
      <p>For security reasons, we recommend changing your password after your first login.</p>
      <p>You can log in using the link below:</p>
      <a href="${process.env.FRONTEND_URL}/login">Login to Your Account</a>
    `;
  }

  _getOTPTemplate(otp) {
    return `
      <h1>Login Verification Code</h1>
      <p>Your verification code is:</p>
      <h2 style="font-size: 24px; letter-spacing: 2px; background: #f4f4f4; padding: 10px; text-align: center;">${otp}</h2>
      <p>This code will expire in 5 minutes.</p>
      <p>If you didn't request this code, please ignore this email.</p>
    `;
  }

  _getPasswordResetTemplate(resetLink) {
    return `
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>\n BTO Core Team</p>
    `;
  }
  _getIndividualTourConfirmationTemplate(name, tour_date, time) {
    return `
      <p>Dear ${name},</p>
      <p>Thank you for submitting a tour application to <strong>Bilkent University</strong> through our platform.</p>
      <p>We have received your request for a tour on <strong>${new Date(tour_date).toLocaleDateString('tr-TR')}</strong> at <strong>${time}</strong>.</p>
      <p>We sincerely appreciate your interest and will carefully review your application. Rest assured, we will promptly initiate the necessary processes to accommodate your request and provide you with further details as soon as possible.</p>
      <p>Best regards,<br/><strong>Bilkent Information Office Team</strong></p>
    `;
  }
}

module.exports = new EmailService();
