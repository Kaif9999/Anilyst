import sgMail from '@sendgrid/mail'
import { NextResponse } from 'next/server'

sgMail.setApiKey(process.env.SENDGRID_API_KEY!)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    const msg = {
      to: 'your-email@example.com', // Your email address
      from: 'your-verified-sender@yourdomain.com', // Your verified SendGrid sender
      subject: 'New Waitlist Signup',
      text: `New signup for waitlist: ${email}`,
      html: `<p>New signup for waitlist: <strong>${email}</strong></p>`,
    }

    await sgMail.send(msg)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Email notification error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process waitlist entry' },
      { status: 500 }
    )
  }
} 