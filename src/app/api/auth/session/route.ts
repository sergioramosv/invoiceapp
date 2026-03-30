import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  const { token } = await request.json()
  const cookieStore = await cookies()

  if (token) {
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
  } else {
    cookieStore.delete('session')
  }

  return NextResponse.json({ ok: true })
}
