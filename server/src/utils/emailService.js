const nodemailer = require("nodemailer");
const dns = require("dns");

// Force IPv4
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },

  // Connection timeout settings
  connectionTimeout: 20000,
  greetingTimeout: 20000,
  socketTimeout: 30000,
});

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    from: `"AI Mock Interview" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email",
    html: `
      <!DOCTYPE html>
      <html>
        <body>
          <h2>Welcome to AI Mock Interview!</h2>

          <p>
            Thank you for registering. Please verify your email address
            by clicking the button below.
          </p>

          <p>
            <a
              href="${verificationUrl}"
              style="
                display: inline-block;
                padding: 12px 20px;
                background-color: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 5px;
              "
            >
              Verify Email
            </a>
          </p>

          <p>This verification link will expire in 24 hours.</p>

          <p>
            If you did not create this account, you can safely ignore this email.
          </p>
        </body>
      </html>
    `,
  });

  console.log("Verification email sent successfully");
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    from: `"AI Mock Interview" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your Password",
    html: `
      <!DOCTYPE html>
      <html>
        <body>
          <h2>Password Reset Request</h2>

          <p>
            We received a request to reset your password.
          </p>

          <p>
            <a
              href="${resetUrl}"
              style="
                display: inline-block;
                padding: 12px 20px;
                background-color: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 5px;
              "
            >
              Reset Password
            </a>
          </p>

          <p>This password reset link will expire in 15 minutes.</p>

          <p>
            If you did not request a password reset, you can safely ignore this email.
          </p>
        </body>
      </html>
    `,
  });

  console.log("Password reset email sent successfully");
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};