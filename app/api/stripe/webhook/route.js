import Stripe from "stripe";
import { db } from "@/app/_utils/firebase";
import { doc, runTransaction, arrayUnion } from "firebase/firestore";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !endpointSecret) {
    return new Response("Missing Stripe signature or webhook secret", {
      status: 400,
    });
  }

  let event;
  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (
    event.type === "charge.succeeded" ||
    event.type === "payment_intent.succeeded"
  ) {
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { userId, videographerId, packageId, serviceTitle } =
      session.metadata || {};

    if (!userId || !videographerId) {
      return new Response("Missing metadata.", { status: 400 });
    }

    try {
      const receiverWalletRef = doc(
        db,
        "users",
        videographerId,
        "wallet",
        "defaultWallet"
      );
      const transactionsRef = doc(db, "transactions", session.id);
      const netAmount = session.amount_total / 100;

      await runTransaction(db, async (transaction) => {
        const receiverWalletSnap = await transaction.get(receiverWalletRef);
        let receiverWalletData = receiverWalletSnap.data() || {
          totalBalance: 0,
          withdrawableBalance: 0,
          lockedAmount: 0,
          transactions: [],
        };

        if (
          receiverWalletData.transactions.some((txn) => txn.id === session.id)
        ) {
          return;
        }

        transaction.set(transactionsRef, {
          id: session.id,
          payerId: userId,
          receiverId: videographerId,
          packageId,
          amount: netAmount,
          serviceTitle,
          status: "pending",
          type: "service_payment",
          timestamp: new Date().toISOString(),
        });

        transaction.update(receiverWalletRef, {
          totalBalance: receiverWalletData.totalBalance + netAmount,
          lockedAmount: receiverWalletData.lockedAmount + netAmount,
          transactions: arrayUnion({
            id: session.id,
            amount: netAmount,
            type: "service_payment",
            timestamp: new Date().toISOString(),
          }),
        });
      });

      return new Response(JSON.stringify({ received: true }), { status: 200 });
    } catch (error) {
      return new Response("Error updating wallet.", { status: 500 });
    }
  }

  return new Response(JSON.stringify({ received: false }), { status: 400 });
}
