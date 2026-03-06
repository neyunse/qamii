import nodemailer from 'nodemailer'

const AUTH_USER = process.env.MAIL_USER
const AUTH_PASS = process.env.MAIL_PASS
const SENDER_EMAIL = process.env.MAIL_SENDER

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: AUTH_USER,
    pass: AUTH_PASS,
  },
})

/**
 * Sends a verification email for new account registration.
 * @param {string} email - Destination email.
 * @param {string} token - Verification token/link.
 * @param {string} siteName - Name of the application.
 */
export async function sendVerificationEmail(email, token, siteName = 'UnLab') {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.APP_URL || process.env.NEXTAUTH_URL || 'https://qamii.com'
  const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`

  const mailOptions = {
    from: {
      name: siteName,
      address: SENDER_EMAIL,
    },
    to: email,
    replyTo: SENDER_EMAIL,
    subject: `Verify your email - ${siteName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to ${siteName}!</h2>
        <p>Please click the button below to verify your email address and activate your account:</p>
        <div style="margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Verify Email</a>
        </div>
        <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="color: #666; font-size: 14px;">${verificationUrl}</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  }

  return transporter.sendMail(mailOptions)
}

/**
 * Sends an OTP code for sensitive actions (email change, delete account, password update).
 * @param {string} email - Destination email.
 * @param {string} code - 6-digit OTP code.
 * @param {string} action - Description of the action (e.g., "delete your account").
 * @param {string} siteName - Name of the application.
 */
export async function sendOTPCode(email, code, action, siteName = 'UnLab') {
  const mailOptions = {
    from: {
      name: siteName,
      address: SENDER_EMAIL,
    },
    to: email,
    replyTo: SENDER_EMAIL,
    subject: `Security Code: ${code} - ${siteName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Security Verification</h2>
        <p>You have requested to <strong>${action}</strong>.</p>
        <p>Please use the following 6-digit code to complete the process:</p>
        <div style="margin: 30px 0; background-color: #f4f4f4; padding: 20px; text-align: center; border-radius: 12px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #000;">${code}</span>
        </div>
        <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">If you didn't request this, please change your password immediately and secure your account.</p>
      </div>
    `,
  }

  return transporter.sendMail(mailOptions)
}

/**
 * Sends a password reset email with a secure link.
 * @param {string} email - Destination email.
 * @param {string} token - Reset token.
 * @param {string} siteName - Name of the application.
 */
export async function sendPasswordResetEmail(email, token, siteName = 'UnLab') {
  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?token=${token}`

  const mailOptions = {
    from: {
      name: siteName,
      address: SENDER_EMAIL,
    },
    to: email,
    replyTo: SENDER_EMAIL,
    subject: `Reset your password - ${siteName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You recently requested to reset your password for your account at ${siteName}. Click the button below to proceed:</p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
        <p style="color: #666; font-size: 14px;">If you did not request a password reset, please ignore this email or contact support if you have concerns.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #999; font-size: 12px;">For your security, never share this link with anyone.</p>
      </div>
    `,
  }

  return transporter.sendMail(mailOptions)
}

/**
 * Sends a system broadcast email to a user.
 * @param {string} email - Destination email.
 * @param {string} title - Title of the broadcast.
 * @param {string} message - Message content of the broadcast, allows basic formatting.
 * @param {string} siteName - Name of the application.
 */
export async function sendBroadcastEmail(email, title, message, siteName = 'UnLab') {
  // Replace newlines with <br /> for HTML emails
  const formattedMessage = message.replace(/\n/g, '<br />')

  const mailOptions = {
    from: {
      name: siteName,
      address: SENDER_EMAIL,
    },
    to: email,
    replyTo: SENDER_EMAIL,
    subject: `${title} - ${siteName} Announcement`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
        <h2 style="color: #000; border-bottom: 2px solid #eee; padding-bottom: 10px;">${title}</h2>
        <div style="margin: 20px 0; font-size: 16px;">
          ${formattedMessage}
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">This is an automated system announcement from ${siteName}. Please do not reply to this email.</p>
      </div>
    `,
  }

  return transporter.sendMail(mailOptions)
}

/**
 * Sends a notification email to a fan when their question is answered.
 * @param {string} email - Destination email.
 * @param {string} creatorName - Name of the creator who answered.
 * @param {string} questionId - ID of the question.
 * @param {string} siteName - Name of the application.
 */
export async function sendAnswerNotificationEmail(email, creatorName, questionId, siteName = 'QAmii') {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.APP_URL || process.env.NEXTAUTH_URL || 'https://qamii.com'
  const questionUrl = `${baseUrl}/q/${questionId}`

  const mailOptions = {
    from: {
      name: siteName,
      address: SENDER_EMAIL,
    },
    to: email,
    replyTo: SENDER_EMAIL,
    subject: `${creatorName} has answered your question! - ${siteName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
        <h2 style="color: #000; border-bottom: 2px solid #eee; padding-bottom: 10px;">Good news!</h2>
        <div style="margin: 20px 0; font-size: 16px;">
          <p><strong>${creatorName}</strong> has just answered the question you paid for.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${questionUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Answer</a>
          </div>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">This is an automated system announcement from ${siteName}. Please do not reply to this email.</p>
      </div>
    `,
  }

  return transporter.sendMail(mailOptions)
}

/**
 * Sends a notification email to a creator when they receive a new paid question.
 * @param {string} email - Destination email (creator's email).
 * @param {string} senderName - Name of who sent it (usually "Someone").
 * @param {string} amountText - The formatted amount paid.
 * @param {string} siteName - Name of the application.
 */
export async function sendNewQuestionEmail(email, senderName, amountText, siteName = 'QAmii') {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.APP_URL || process.env.NEXTAUTH_URL || 'https://qamii.com'
  const dashboardUrl = `${baseUrl}/dashboard`

  const mailOptions = {
    from: {
      name: siteName,
      address: SENDER_EMAIL,
    },
    to: email,
    replyTo: SENDER_EMAIL,
    subject: `You received a new question! (${amountText}) - ${siteName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.6; color: #333;">
        <h2 style="color: #000; border-bottom: 2px solid #eee; padding-bottom: 10px;">Cha-ching! 🎉</h2>
        <div style="margin: 20px 0; font-size: 16px;">
          <p><strong>${senderName}</strong> just paid <strong>${amountText}</strong> to ask you a question on ${siteName}!</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="${dashboardUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Go to Dashboard</a>
          </div>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="color: #999; font-size: 12px; text-align: center;">This is an automated system announcement from ${siteName}. Please do not reply to this email.</p>
      </div>
    `,
  }

  return transporter.sendMail(mailOptions)
}
