import Stripe from "stripe";
import { db } from "@/app/_utils/firebase";
import { doc, runTransaction, arrayUnion } from "firebase/firestore";

export const config = {
  api: {
    bodyParser: false, // 禁用默认 JSON 解析，保持原始请求体
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !endpointSecret) {
    console.error("Missing Stripe signature or webhook secret");
    return new Response("Missing Stripe signature or webhook secret", {
      status: 400,
    });
  }

  let event;
  try {
    const rawBody = await req.text(); // 读取原始请求体
    event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
    console.log("Webhook received:", event.type);
  } catch (err) {
    console.error("Webhook verification failed:", err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // 处理支付成功事件
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata?.userId;

    if (!userId) {
      console.error("Missing userId in metadata.");
      return new Response("Missing userId in metadata.", { status: 400 });
    }

    try {
      const walletRef = doc(db, "users", userId, "wallet", "defaultWallet");

      await runTransaction(db, async (transaction) => {
        const walletSnap = await transaction.get(walletRef);
        if (!walletSnap.exists()) {
          console.warn(`Wallet not found for user: ${userId}, creating one...`);
          transaction.set(walletRef, {
            totalBalance: 0,
            withdrawableBalance: 0,
            transactions: [],
          });
        }

        const walletData = (await transaction.get(walletRef)).data();

        // 检查是否已经处理过这笔交易
        const existingTransaction = walletData.transactions?.some(
          (txn) => txn.id === session.id
        );

        if (existingTransaction) {
          console.warn("Transaction already processed, skipping...");
          return;
        }

        const netAmount = session.amount_total / 100;

        transaction.update(walletRef, {
          totalBalance: (walletData.totalBalance || 0) + netAmount,
          withdrawableBalance:
            (walletData.withdrawableBalance || 0) + netAmount,
          transactions: arrayUnion({
            id: session.id, // 使用 session.id 作为交易 ID
            amount: netAmount,
            type: "deposit",
            timestamp: new Date().toISOString(),
          }),
        });

        console.log(`Wallet updated for user ${userId}: +$${netAmount}`);
      });

      return new Response(JSON.stringify({ received: true }), { status: 200 });
    } catch (error) {
      console.error("Error updating wallet:", error);
      return new Response("Error updating wallet.", { status: 500 });
    }
  }

  return new Response(JSON.stringify({ received: false }), { status: 400 });
}
