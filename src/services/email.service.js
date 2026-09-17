const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendVerificationEmail(email, username, token) {
  const verificationUrl =
    `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verify your Wildlife account 🦜",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        
        <h1>Welcome to Wildlife, ${username}! 🦜</h1>

        <p>
          Thanks for creating your Wildlife account.
        </p>

        <p>
          Please verify your email address by clicking the button below.
        </p>

        <a
          href="${verificationUrl}"
          style="
            display: inline-block;
            padding: 12px 24px;
            background: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
          "
        >
          Verify Email
        </a>

        <p style="margin-top: 24px;">
          This verification link will expire in 15 minutes.
        </p>

        <p>
          If you didn't create this account, you can safely ignore this email.
        </p>

      </div>
    `,
  });
}

async function sendPasswordResetEmail(email, username, token) {
  const resetUrl =
    `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Reset your Wildlife password 🔐",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">

        <h1>Password Reset 🔐</h1>

        <p>
          Hi ${username},
        </p>

        <p>
          We received a request to reset your Wildlife account password.
        </p>

        <p>
          Click the button below to create a new password.
        </p>

        <a
          href="${resetUrl}"
          style="
            display: inline-block;
            padding: 12px 24px;
            background: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
          "
        >
          Reset Password
        </a>

        <p style="margin-top: 24px;">
          This link will expire in 15 minutes.
        </p>

        <p>
          If you didn't request a password reset, you can safely ignore this email.
        </p>

      </div>
    `,
  });
}

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};