import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getStripe, PRICE_ID } from '@/lib/stripe'

export async function POST() {
  const cookieStore = await cookies()
  const session = cookieStore.get('session')
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{ price: PRICE_ID, quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/workspace?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?payment=cancelled`,
      metadata: { sessionToken: session.value },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch {
    return NextResponse.json(
      { error: 'Failed to create checkout' },
      { status: 500 }
    )
  }
}
