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


const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${encodeURIComponent(token)}`;

  await resend.emails.send({
    from: "AI Assistant <onboarding@resend.dev>",
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

          <p>This verification link will expire in 24 hours.</p>

          <p>
            If you did not create this account, you can safely ignore this email.
          </p>
        </body>
      </html>
    `,
  });
};

const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;

  await resend.emails.send({
    from: "AI Assistant <onboarding@resend.dev>",
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
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};

