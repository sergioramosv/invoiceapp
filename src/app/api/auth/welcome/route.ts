import { NextResponse } from 'next/server'
import { sendWelcomeEmail } from '@/lib/emails'

export async function POST(request: Request) {
  try {
    const { email, name } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    await sendWelcomeEmail(email, name || 'Usuario')

    return NextResponse.json({ sent: true })
  } catch {
    return NextResponse.json(
      { error: 'Failed to send welcome email' },
      { status: 500 }
    )
  }
}
