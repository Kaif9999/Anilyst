import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    // Check if email already exists
    const existingEntry = await prisma.waitlist.findUnique({
      where: { email }
    })

    if (existingEntry) {
      return NextResponse.json(
        { success: false, error: 'Email already registered' },
        { status: 400 }
      )
    }

    const waitlistEntry = await prisma.waitlist.create({
      data: {
        email,
        joinedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, data: waitlistEntry })
  } catch (error) {
    console.error('Waitlist submission error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to join waitlist' },
      { status: 500 }
    )
  }
} 