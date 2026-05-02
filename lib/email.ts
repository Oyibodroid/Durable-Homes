import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL ?? 'noreply@durablehomes.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// ─── Generic sender ───────────────────────────────────────────────────────────

async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string
  subject: string
  html: string
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: `Durable Homes <${FROM}>`,
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const baseStyle = `
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  background: #f9f9f7;
  margin: 0;
  padding: 0;
`

const containerStyle = `
  max-width: 560px;
  margin: 40px auto;
  background: #ffffff;
  border: 1px solid #e8e2d5;
  border-radius: 8px;
  overflow: hidden;
`

const headerStyle = `
  background: #1a1208;
  padding: 28px 32px;
`

const bodyStyle = `
  padding: 32px;
  color: #3a3020;
  font-size: 15px;
  line-height: 1.7;
`

const buttonStyle = `
  display: inline-block;
  background: #C9A84C;
  color: #1a1208 !important;
  text-decoration: none;
  padding: 12px 28px;
  border-radius: 6px;
  font-weight: 600;
  font-size: 15px;
  margin: 20px 0;
`

const footerStyle = `
  padding: 20px 32px;
  border-top: 1px solid #e8e2d5;
  font-size: 12px;
  color: #9a8e78;
  text-align: center;
`

function emailWrapper(content: string) {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
    <body style="${baseStyle}">
      <div style="${containerStyle}">
        <div style="${headerStyle}">
          <span style="color: #C9A84C; font-size: 20px; font-weight: 700; letter-spacing: 0.05em;">
            DURABLE HOMES
          </span>
        </div>
        <div style="${bodyStyle}">
          ${content}
        </div>
        <div style="${footerStyle}">
          &copy; ${new Date().getFullYear()} Durable Homes. All rights reserved.<br>
          Building Materials & Interiors
        </div>
      </div>
    </body>
    </html>
  `
}

// ─── Order confirmation ───────────────────────────────────────────────────────

export async function sendOrderConfirmationEmail({
  to,
  orderNumber,
  orderId,
  items,
  total,
  shippingAddress,
}: {
  to: string
  orderNumber: string
  orderId: string
  items: { name: string; quantity: number; price: number }[]
  total: number
  shippingAddress: {
    firstName: string
    lastName: string
    addressLine1: string
    city: string
    state: string
  }
}) {
  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0ebe0;">
          ${item.name} × ${item.quantity}
        </td>
        <td style="padding: 10px 0; border-bottom: 1px solid #f0ebe0; text-align: right; font-weight: 600;">
          ₦${(item.price * item.quantity).toLocaleString()}
        </td>
      </tr>
    `
    )
    .join('')

  const html = emailWrapper(`
    <h2 style="margin: 0 0 8px; color: #1a1208; font-size: 22px;">Order Confirmed!</h2>
    <p style="margin: 0 0 24px; color: #7a6a50;">
      Thank you for your purchase. Your order has been received and is being processed.
    </p>

    <div style="background: #fdf8ee; border: 1px solid #e8d8a0; border-radius: 6px; padding: 16px 20px; margin-bottom: 24px;">
      <span style="font-size: 13px; color: #9a8e78;">Order number</span><br>
      <span style="font-size: 18px; font-weight: 700; color: #1a1208;">${orderNumber}</span>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      ${itemRows}
      <tr>
        <td style="padding: 14px 0 0; font-weight: 700; font-size: 16px;">Total Paid</td>
        <td style="padding: 14px 0 0; text-align: right; font-weight: 700; font-size: 16px; color: #C9A84C;">
          ₦${Number(total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </td>
      </tr>
    </table>

    <div style="background: #f5f0e8; border-radius: 6px; padding: 16px 20px; margin-bottom: 28px; font-size: 14px;">
      <strong>Shipping to:</strong><br>
      ${shippingAddress.firstName} ${shippingAddress.lastName}<br>
      ${shippingAddress.addressLine1}<br>
      ${shippingAddress.city}, ${shippingAddress.state}
    </div>

    <a href="${APP_URL}/account/orders/${orderId}" style="${buttonStyle}">
      Track Your Order
    </a>

    <p style="margin-top: 24px; font-size: 14px; color: #7a6a50;">
      If you have any questions, reply to this email or visit our
      <a href="${APP_URL}/contact" style="color: #C9A84C;">contact page</a>.
    </p>
  `)

  return sendEmail({
    to,
    subject: `Order Confirmed — ${orderNumber}`,
    html,
  })
}

// ─── Password reset ───────────────────────────────────────────────────────────

export async function sendPasswordResetEmail({
  to,
  token,
}: {
  to: string
  token: string
}) {
  const resetUrl = `${APP_URL}/auth/reset-password?token=${token}`

  const html = emailWrapper(`
    <h2 style="margin: 0 0 8px; color: #1a1208; font-size: 22px;">Reset Your Password</h2>
    <p style="margin: 0 0 24px; color: #7a6a50;">
      We received a request to reset the password for your Durable Homes account.
      Click the button below to choose a new password.
    </p>

    <a href="${resetUrl}" style="${buttonStyle}">
      Reset Password
    </a>

    <p style="margin-top: 24px; font-size: 14px; color: #7a6a50;">
      This link expires in <strong>1 hour</strong>. If you didn't request a password
      reset, you can safely ignore this email — your password won't change.
    </p>

    <p style="font-size: 13px; color: #9a8e78; word-break: break-all;">
      Or copy this link: ${resetUrl}
    </p>
  `)

  return sendEmail({
    to,
    subject: 'Reset your Durable Homes password',
    html,
  })
}

// ─── Email verification ───────────────────────────────────────────────────────

export async function sendEmailVerificationEmail({
  to,
  token,
  name,
}: {
  to: string
  token: string
  name?: string
}) {
  const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${token}`

  const html = emailWrapper(`
    <h2 style="margin: 0 0 8px; color: #1a1208; font-size: 22px;">
      Welcome${name ? `, ${name}` : ''}!
    </h2>
    <p style="margin: 0 0 24px; color: #7a6a50;">
      Thanks for signing up to Durable Homes. Please verify your email address
      to activate your account and start shopping.
    </p>

    <a href="${verifyUrl}" style="${buttonStyle}">
      Verify Email Address
    </a>

    <p style="margin-top: 24px; font-size: 14px; color: #7a6a50;">
      This link expires in <strong>24 hours</strong>. If you didn't create an
      account, you can safely ignore this email.
    </p>
  `)

  return sendEmail({
    to,
    subject: 'Verify your Durable Homes email address',
    html,
  })
}