const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;

  await transporter.sendMail({
    from: `"AI Assistant" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Verify Your Email",
    html: `
      <!DOCTYPE html>
      <html>
        <body>
          <h2>Welcome to AI Assistant!</h2>

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

          <p>
            This verification link will expire in 24 hours.
          </p>

          <p>
            If you did not create this account, you can safely ignore this email.
          </p>
        </body>
      </html>
    `,
  });
};

module.exports = {
  sendVerificationEmail,
};