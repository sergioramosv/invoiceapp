import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getAdminDb } from '@/lib/firebase-admin'
import { sendPaymentConfirmation } from '@/lib/emails'

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')!

  try {
    const event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const customerEmail = session.customer_details?.email

      if (customerEmail) {
        const usersRef = getAdminDb().collection('users')
        const snapshot = await usersRef
          .where('email', '==', customerEmail)
          .limit(1)
          .get()

        if (!snapshot.empty) {
          const userDoc = snapshot.docs[0]
          await userDoc.ref.update({
            isPaid: true,
            paidAt: new Date().toISOString(),
            stripeCustomerId: session.customer,
          })

          const userData = userDoc.data()
          const name = userData.displayName || userData.email || ''
          const amount = session.amount_total
            ? `${(session.amount_total / 100).toFixed(2)}€`
            : '29€'

          await sendPaymentConfirmation(customerEmail, name, amount)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 })
  }
}
