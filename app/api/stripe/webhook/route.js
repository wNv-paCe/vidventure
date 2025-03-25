import Stripe from "stripe";
import { db } from "@/app/_utils/firebase";
import { doc, runTransaction } from "firebase/firestore";
import { buffer } from "micro";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers.get("stripe-signature");

  if (!sig || !endpointSecret) {
    return new Response("Missing Stripe signature or webhook secret", {
      status: 400,
    });
  }

  let event;
  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
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
          withdrawableBalance: 0,
          lockedAmount: 0,
        };

        if (
          receiverWalletData.transactions &&
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
          lockedAmount: receiverWalletData.lockedAmount + netAmount,
        });
      });

      return new Response(JSON.stringify({ received: true }), { status: 200 });
    } catch (error) {
      return new Response("Error updating wallet.", { status: 500 });
    }
  }

  return new Response(JSON.stringify({ received: false }), { status: 400 });
}
