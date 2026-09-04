// const nodemailer = require("nodemailer");

// // const transporter = nodemailer.createTransport({
// //   service: "gmail",
// //   auth: {
// //     user: process.env.EMAIL_USER,
// //     pass: process.env.EMAIL_PASS,
// //   },
// //   tls: {
// //     rejectUnauthorized: false,
// //   },
// // });
// const transporter = nodemailer.createTransport({
//   host: "smtp.gmail.com",
//   port: 587,
//   secure: false,
//   family: 4,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// const sendVerificationEmail = async (email, token) => {
//   const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;

//   await transporter.sendMail({
//     from: `"AI Assistant" <${process.env.EMAIL_USER}>`,
//     to: email,
//     subject: "Verify Your Email",
//     html: `
//       <!DOCTYPE html>
//       <html>
//         <body>
//           <h2>Welcome to AI Assistant!</h2>

//           <p>
//             Thank you for registering. Please verify your email address
//             by clicking the button below.
//           </p>

//           <p>
//             <a
//               href="${verificationUrl}"
//               style="
//                 display: inline-block;
//                 padding: 12px 20px;
//                 background-color: #007bff;
//                 color: white;
//                 text-decoration: none;
//                 border-radius: 5px;
//               "
//             >
//               Verify Email
//             </a>
//           </p>

//           <p>
//             This verification link will expire in 24 hours.
//           </p>

//           <p>
//             If you did not create this account, you can safely ignore this email.
//           </p>
//         </body>
//       </html>
//     `,
//   });
// };

// const sendPasswordResetEmail = async (email, token) => {
//   const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;

//   await transporter.sendMail({
//     from: `"AI Assistant" <${process.env.EMAIL_USER}>`,
//     to: email,
//     subject: "Reset Your Password",
//     html: `
//       <!DOCTYPE html>
//       <html>
//         <body>
//           <h2>Password Reset Request</h2>

//           <p>
//             We received a request to reset your password.
//           </p>

//           <p>
//             <a
//               href="${resetUrl}"
//               style="
//                 display: inline-block;
//                 padding: 12px 20px;
//                 background-color: #007bff;
//                 color: white;
//                 text-decoration: none;
//                 border-radius: 5px;
//               "
//             >
//               Reset Password
//             </a>
//           </p>

//           <p>
//             This password reset link will expire in 15 minutes.
//           </p>

//           <p>
//             If you did not request a password reset, you can safely ignore this email.
//           </p>
//         </body>
//       </html>
//     `,
//   });
// };
// module.exports = {
//   sendVerificationEmail,
//   sendPasswordResetEmail,
// };

const sendBrevoEmail = async (to, subject, html) => {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": process.env.BREVO_API_KEY,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: {
        name: "AI Mock Interview",
        email: "vijisubu2314@gmail.com",
      },
      to: [
        {
          email: to,
        },
      ],
      subject,
      htmlContent: html,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("Brevo Email Error:", data);
    throw new Error(data.message || "Failed to send email");
  }

  console.log("Brevo Email Sent:", data);
  return data;
};

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;

  await sendBrevoEmail(
    email,
    "Verify Your Email",
    `
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
  );
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;

  await sendBrevoEmail(
    email,
    "Reset Your Password",
    `
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
  );
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};